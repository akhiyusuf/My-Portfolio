import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatIcon, SendIcon, XIcon, ShareIcon, PencilIcon, CalculatorIcon } from './Icons';

// --- START: Custom Markdown Renderer ---

/**
 * Parses a string for inline markdown (**bold**, *italic*, `code`, [links](url)) and returns React nodes.
 * @param text The plain text to parse.
 * @returns A React.ReactNode containing formatted text.
 */
const parseInlineText = (text: string): React.ReactNode => {
    // Groups: 1: bold, 2: italic, 3: code, 4: link text, 5: link url
    const regex = /\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`|\[(.*?)\]\((.*?)\)/g;
    
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(text.substring(lastIndex, match.index));
        }

        const [, bold, italic, code, linkText, linkUrl] = match;

        if (bold !== undefined) nodes.push(<strong key={lastIndex}>{bold}</strong>);
        else if (italic !== undefined) nodes.push(<em key={lastIndex}>{italic}</em>);
        else if (code !== undefined) nodes.push(<code key={lastIndex} className="bg-slate-300 dark:bg-gray-800 text-sky-600 dark:text-sky-400 font-mono text-sm rounded px-1.5 py-1">{code}</code>);
        else if (linkText !== undefined && linkUrl !== undefined) nodes.push(<a href={linkUrl} key={lastIndex} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">{linkText}</a>);

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        nodes.push(text.substring(lastIndex));
    }

    return nodes.length > 1 ? nodes.map((node, index) => <React.Fragment key={index}>{node}</React.Fragment>) : nodes[0] || '';
};

/**
 * Renders a block of text that can contain paragraphs and nested lists.
 */
const ParagraphAndListRenderer: React.FC<{ block: string; onViewCalculatorClick?: () => void }> = ({ block, onViewCalculatorClick }) => {
    const lines = block.split('\n');

    const nodePrototypes = lines.map(line => {
        const match = line.match(/^(\s*)((?:[\*\-+]|\d+\.)\s)(.*)/);
        if (!match) return { type: 'p', content: line, level: 0, listType: null };

        const level = Math.floor(match[1].length / 2);
        const listType = match[2].match(/\d/) ? 'ol' : 'ul';
        return { type: 'li', content: match[3], level, listType };
    });

    const renderNodes = (nodes: typeof nodePrototypes, level: number = 0): React.ReactNode[] => {
        const elements: React.ReactNode[] = [];
        let i = 0;
        
        let paragraphBuffer: string[] = [];
        const flushParagraph = () => {
            if (paragraphBuffer.length === 0) return;
            const text = paragraphBuffer.join('\n');
             const actionTag = '[action:view_calculator]';
            if (onViewCalculatorClick && text.includes(actionTag)) {
                 const parts = text.split(actionTag);
                 elements.push(
                    <div key={`p-action-${i}`} className="space-y-2">
                         {parts.map((part, idx) => {
                            const trimmedPart = part.trim();
                            return (
                                <React.Fragment key={idx}>
                                    {trimmedPart && <p>{parseInlineText(trimmedPart)}</p>}
                                    {idx < parts.length - 1 && (
                                        <button onClick={onViewCalculatorClick} className="inline-flex items-center gap-2 bg-slate-200 dark:bg-gray-800 text-slate-800 dark:text-gray-200 font-medium py-2 px-3 rounded-lg my-1 hover:bg-slate-300 dark:hover:bg-gray-700 transition-colors text-sm">
                                            <CalculatorIcon className="w-4 h-4" />
                                            <span>View Project Calculator</span>
                                        </button>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                );
            } else {
                 elements.push(<p key={`p-${i}`}>{parseInlineText(text)}</p>);
            }
            paragraphBuffer = [];
        };

        while (i < nodes.length) {
            const node = nodes[i];

            if (node.level < level) break; // Go back up the recursion

            if (node.type === 'p') {
                if (node.content.trim()) paragraphBuffer.push(node.content);
                i++;
                continue;
            }

            if (node.type === 'li' && node.level === level) {
                flushParagraph();
                const listType = node.listType;
                const listItems: React.ReactNode[] = [];
                
                // Collect all items for the current list
                while (i < nodes.length && nodes[i].type === 'li' && nodes[i].level === level && nodes[i].listType === listType) {
                    const currentItemNode = nodes[i];
                    
                    const childrenStartIndex = i + 1;
                    let childrenEndIndex = childrenStartIndex;
                    while (childrenEndIndex < nodes.length && nodes[childrenEndIndex].level > level) {
                        childrenEndIndex++;
                    }

                    const children = renderNodes(nodes.slice(childrenStartIndex, childrenEndIndex), level + 1);
                    listItems.push(<li key={i}>{parseInlineText(currentItemNode.content)}{children}</li>);
                    i = childrenEndIndex;
                }

                const ListTag = listType!;
                const className = ListTag === 'ul' ? "list-disc pl-5 space-y-1" : "list-decimal pl-5 space-y-1";
                elements.push(<ListTag key={`list-${level}-${i}`} className={className}>{listItems}</ListTag>);
            } else {
                i++;
            }
        }
        flushParagraph();
        return elements;
    };

    return <>{renderNodes(nodePrototypes)}</>;
};

const MarkdownRenderer: React.FC<{ content: string; onViewCalculatorClick?: () => void }> = ({ content, onViewCalculatorClick }) => {
    const blocks: string[] = [];
    let currentBlockLines: string[] = [];
    content.split('\n').forEach(line => {
        if (line.trim() === '') {
            if (currentBlockLines.length > 0) blocks.push(currentBlockLines.join('\n'));
            currentBlockLines = [];
        } else {
            currentBlockLines.push(line);
        }
    });
    if (currentBlockLines.length > 0) blocks.push(currentBlockLines.join('\n'));
    
    const renderBlock = (block: string, index: number): React.ReactNode => {
        // Horizontal Rule
        if (block.match(/^(\*\*\*|---|___)\s*$/)) return <hr key={index} className="my-3 border-slate-300 dark:border-gray-600" />;
        
        // Headings
        const headingMatch = block.match(/^(#{1,6})\s(.*)/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const text = headingMatch[2];
            // FIX: Qualify JSX namespace with React to resolve "Cannot find namespace 'JSX'" error.
            const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
            const sizeClasses = ['text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm'];
            const classNames = `${sizeClasses[level-1]} font-bold mt-3 mb-1 ${level < 3 ? 'border-b border-slate-300 dark:border-gray-600 pb-1' : ''}`;
            return <Tag key={index} className={classNames}>{parseInlineText(text)}</Tag>;
        }
        
        // Blockquote
        if (block.startsWith('>')) {
            const quoteContent = block.split('\n').map(line => line.replace(/^>\s?/, '')).join('\n');
            return <blockquote key={index} className="border-l-4 border-slate-300 dark:border-gray-600 pl-4 italic text-slate-600 dark:text-gray-400"><MarkdownRenderer content={quoteContent} onViewCalculatorClick={onViewCalculatorClick} /></blockquote>;
        }

        // Code blocks
        if (block.startsWith('```') && block.endsWith('```')) {
            const code = block.slice(3, -3).trim();
            return <pre key={index} className="bg-slate-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto"><code className="font-mono text-sm">{code}</code></pre>;
        }
        
        // Table
        const tableLines = block.trim().split('\n');
        if (tableLines.length > 1 && tableLines[0].includes('|') && tableLines[1].replace(/[-|:\s]/g, '').length === 0) {
            try {
                const header = tableLines[0].split('|').map(s => s.trim()).filter(Boolean);
                const rows = tableLines.slice(2).map(line => line.split('|').map(s => s.trim()).filter(Boolean));
                
                if (header.length > 0 && rows.every(r => r.length === header.length)) {
                    return (
                        <div key={index} className="overflow-x-auto border border-slate-300 dark:border-gray-600 rounded-lg">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-300 dark:border-gray-600">
                                        {header.map((h, i) => <th key={i} className="p-2 font-semibold">{parseInlineText(h)}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={i} className={`border-b border-slate-200 dark:border-gray-700 ${i === rows.length - 1 ? 'border-b-0' : ''}`}>
                                            {row.map((cell, j) => <td key={j} className="p-2">{parseInlineText(cell)}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
            } catch (e) { console.error("Markdown table parsing failed:", e); }
        }

        // Default to paragraph and list renderer
        return <ParagraphAndListRenderer key={index} block={block} onViewCalculatorClick={onViewCalculatorClick} />;
    };
    
    return <div className="chatbot-content space-y-4 text-left">{blocks.map(renderBlock)}</div>;
};
// --- END: Custom Markdown Renderer ---


interface Message {
    role: 'user' | 'model';
    text: string;
}

interface ChatbotProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    initialMessage: string;
    clearInitialMessage: () => void;
    onViewCalculatorClick: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ 
    isOpen, 
    setIsOpen, 
    initialMessage, 
    clearInitialMessage,
    onViewCalculatorClick,
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const shareMenuRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<Chat | null>(null);
    const hasSentWelcome = useRef(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);

    // Draggable state
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });


    const systemInstruction = `You are 'Amir', a friendly and knowledgeable AI assistant for Yusuf, a freelance frontend developer. Your goal is to answer questions about his skills, services, and portfolio projects to encourage potential clients to get in touch.

Your Knowledge Base:
- **Services**: App Development & Design, Frontend Development (React, Next.js), eCommerce & CMS Solutions.
- **Skills**: React, Next.js, TypeScript, Tailwind CSS (Frontend); Node.js, REST APIs, GraphQL (Backend); Git, Vercel, Docker, CI/CD (DevOps).
- **Projects**: An E-commerce Platform, a Task Management App, and this portfolio itself.
- **About Yusuf**: A frontend developer specializing in high-performance, user-friendly websites and applications with a keen eye for design.
- **Project Features (from the Calculator)**: The pricing calculator on the website lists various features a user can select for THEIR POTENTIAL PROJECT. You are an expert on these. You can discuss what each option means, such as the difference between 'Design Tiers' (Template vs. Custom), page types, CMS options, e-commerce features, user authentication, and API integrations. Your goal is to help the user understand these options for *their own project*.

Your Core Directives:
1.  Be conversational, professional, and helpful. Use Markdown for formatting to make your answers clear and readable. This includes using **bold text**, *italic text*, nested lists (using 2-space indentation), blockquotes (>), and horizontal rules (---).
2.  When asked about services, skills, or projects, provide concise and informative answers based on the knowledge base.
3.  If the user provides their project estimate details, acknowledge their selections and offer to discuss the features for their project, clarify what they mean, and explain how Yusuf's skills would be a good fit. For example, if they mention "e-commerce", you can talk about his experience with Stripe.
4.  Currently, you **cannot** directly control the website or change the calculator settings. Politely explain this limitation if asked. However, let them know that an exciting update is planned which will allow you to edit the calculator and provide smart suggestions directly.
5.  If a conversation gets technical about project costs or specific features, guide them to the pricing calculator. To do this, include the special string \`[action:view_calculator]\` in your response. This will automatically create a button. Crucially, also tell them to use the "Discuss with AI" button within the calculator when they're done to bring their selections back into the conversation. For example: "You can explore those options and get a live estimate using the project calculator. When you're happy with your selections, click the 'Discuss with AI' button there to share them with me! [action:view_calculator]"
6.  Your primary goal is to build confidence in Yusuf's abilities and guide the user towards contacting him. End conversations by suggesting they use the "Get in Touch" button.`;

    const suggestedPrompts = [
        { text: "Tell me about your services", editable: false },
        { text: "What's your experience with React?", editable: false },
        { text: "How long would it take to build a [type of website]?", editable: true },
        { text: "Compare 'Custom Design' and 'Premium Custom' tiers.", editable: false },
    ];

    useEffect(() => {
        if (isOpen && !hasSentWelcome.current && messages.length === 0) {
            hasSentWelcome.current = true;
            setShowSuggestions(true);
            setMessages([{ role: 'model', text: "Hi! I'm Amir, an AI assistant. I can help you learn about Yusuf's work or discuss your project estimate. How can I help?" }]);
        }
    }, [isOpen, messages]);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('chat-open');
        } else {
            document.body.classList.remove('chat-open');
        }
        return () => {
            document.body.classList.remove('chat-open');
        };
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setIsShareMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const sendMessageToAi = async (messageText: string) => {
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        try {
            if (!chatRef.current) {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: systemInstruction,
                    },
                });
            }
            
            const response = await chatRef.current.sendMessageStream({ message: messageText });
            
            for await (const chunk of response) {
              const chunkText = chunk.text;
              setMessages(prev => {
                  const lastMessage = prev[prev.length - 1];
                  const updatedLastMessage = { ...lastMessage, text: lastMessage.text + chunkText };
                  return [...prev.slice(0, -1), updatedLastMessage];
              });
            }

        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                const updatedLastMessage = { ...lastMessage, text: "Sorry, I encountered an error. Please try again." };
                return [...prev.slice(0, -1), updatedLastMessage];
            });
        } finally {
            setIsLoading(false);
        }
    };

     useEffect(() => {
        if (initialMessage) {
            setShowSuggestions(false);
            const userMessage: Message = { role: 'user', text: initialMessage };
            setMessages(prev => [...prev, userMessage]);
            sendMessageToAi(initialMessage);
            clearInitialMessage();
        }
    }, [initialMessage]);

    const sendSuggestedPrompt = async (prompt: string) => {
        if (isLoading) return;
        setShowSuggestions(false);
        const userMessage: Message = { role: 'user', text: prompt };
        setMessages(prev => [...prev, userMessage]);
        await sendMessageToAi(prompt);
    };

    const handleEditablePrompt = (prompt: string) => {
        setInputValue(prompt);
        inputRef.current?.focus();
    };

    const submitMessage = async () => {
        if (!inputValue.trim() || isLoading) return;
        setShowSuggestions(false);

        const userMessage: Message = { role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        const messageToSend = inputValue;
        setInputValue('');
        
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }
        
        await sendMessageToAi(messageToSend);
    };
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        submitMessage();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitMessage();
        }
    };


    const formatChatForExport = (): string => {
        return messages.map(msg => {
            const prefix = msg.role === 'user' ? 'You' : 'Amir';
            return `${prefix}: ${msg.text}`;
        }).join('\n\n');
    };

    const handleCopyToClipboard = () => {
        const chatText = formatChatForExport();
        navigator.clipboard.writeText(chatText).then(() => {
            alert('Chat copied to clipboard!');
            setIsShareMenuOpen(false);
        }).catch(err => {
            console.error('Failed to copy chat: ', err);
            alert('Failed to copy chat.');
        });
    };

    const handleDownloadText = () => {
        const chatText = formatChatForExport();
        const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat-with-amir.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsShareMenuOpen(false);
    };

    const handlePrint = () => {
        setIsShareMenuOpen(false);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const chatHtml = messages.map(msg => {
                const sender = msg.role === 'user' ? 'You' : 'Amir';
                const messageClass = msg.role === 'user' ? 'user-message' : 'model-message';
                const text = msg.text.replace(/&/g, '&amp;').replace(/</g, "&lt;").replace(/>/g, "&gt;");
                return `<div class="${messageClass}"><strong>${sender}:</strong> <p>${text.replace(/\n/g, '<br>')}</p></div>`;
            }).join('');

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Chat with Amir</title>
                        <style>
                            @media print { body { -webkit-print-color-adjust: exact; } }
                            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"; line-height: 1.6; color: #333; padding: 1rem; }
                            h1 { color: #111; }
                            .user-message, .model-message { margin-bottom: 1rem; padding: 0.75rem 1rem; border-radius: 12px; max-width: 80%; word-wrap: break-word; }
                            .user-message { background-color: #dbeafe; margin-left: auto; border-bottom-right-radius: 4px; }
                            .model-message { background-color: #e5e7eb; border-bottom-left-radius: 4px;}
                            p { margin: 0.25rem 0 0; white-space: pre-wrap; }
                            strong { display: block; margin-bottom: 4px; }
                        </style>
                    </head>
                    <body>
                        <h1>Chat with Amir</h1>
                        <div>${chatHtml}</div>
                        <script>
                            window.onload = function() {
                                window.print();
                                window.close();
                            }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
        } else {
            alert("Please allow pop-ups to print the chat.");
        }
    };
    
    // --- Draggable Logic ---
    const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
        if (window.innerWidth < 768) return; // Only allow drag on desktop
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
        document.body.classList.add('select-none');
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !wrapperRef.current) return;
            
            let newX = e.clientX - dragOffset.x;
            let newY = e.clientY - dragOffset.y;

            // Boundary checks
            const wrapperRect = wrapperRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (wrapperRect.left + newX < 24) newX = 24 - wrapperRect.left;
            if (wrapperRect.right + newX > viewportWidth - 24) newX = viewportWidth - 24 - wrapperRect.right;
            if (wrapperRect.top + newY < 24) newY = 24 - wrapperRect.top;
            if (wrapperRect.bottom + newY > viewportHeight - 24) newY = viewportHeight - 24 - wrapperRect.bottom;
            
            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.classList.remove('select-none');
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);


    return (
        <>
            {/* Wrapper for positioning and open/close animation */}
            <div
                ref={wrapperRef}
                className={`fixed z-50 transition-all duration-300 ease-in-out
                    inset-0
                    md:inset-auto md:bottom-24 md:right-6 md:w-full md:max-w-sm md:h-[70vh] md:max-h-[600px]
                    ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`
                }
            >
                {/* Draggable Chat Window */}
                <div 
                    ref={chatWindowRef}
                    className={`bg-white dark:bg-[#1a1a1a] flex flex-col shadow-2xl h-full w-full
                        border-0 rounded-none
                        md:rounded-2xl md:border md:border-slate-200 dark:md:border-gray-800
                        ${isDragging ? 'transition-none' : ''}`
                    } 
                    style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                    role="dialog" 
                    aria-modal="true" 
                    aria-hidden={!isOpen}
                >
                    <header onMouseDown={handleMouseDown} className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-gray-700 flex-shrink-0 md:cursor-move">
                        <h2 className="text-lg font-medium text-slate-900 dark:text-white">AI Assistant</h2>
                        <div className="flex items-center gap-2">
                            {messages.length > 1 && (
                                <div className="relative" ref={shareMenuRef}>
                                    <button 
                                        onClick={() => setIsShareMenuOpen(prev => !prev)} 
                                        className="text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white" 
                                        aria-label="Share or export chat"
                                        aria-haspopup="true"
                                        aria-expanded={isShareMenuOpen}
                                    >
                                        <ShareIcon />
                                    </button>
                                    {isShareMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#2a2a2a] border border-slate-200 dark:border-gray-700 rounded-md shadow-lg z-10 py-1 animate-fade-in-scale">
                                            <button onClick={handlePrint} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors">Print / Save as PDF</button>
                                            <button onClick={handleCopyToClipboard} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors">Copy to Clipboard</button>
                                            <button onClick={handleDownloadText} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors">Download as .txt File</button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white" aria-label="Close chat">
                                <XIcon />
                            </button>
                        </div>
                    </header>

                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`rounded-2xl px-4 py-2 max-w-sm break-words ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                                    {msg.role === 'user' 
                                        ? <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                        : <MarkdownRenderer content={msg.text} onViewCalculatorClick={onViewCalculatorClick} />
                                    }
                                </div>
                            </div>
                        ))}
                        {isLoading && messages[messages.length - 1]?.text === '' && (
                            <div className="flex justify-start">
                                <div className="bg-slate-200 dark:bg-gray-700 text-gray-200 rounded-2xl px-4 py-2">
                                    <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-slate-400 dark:bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-slate-400 dark:bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-slate-400 dark:bg-gray-400 rounded-full animate-pulse"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {showSuggestions && !isLoading && messages.length <= 1 && (
                        <div className="px-4 pb-2 flex-shrink-0 flex flex-wrap gap-2">
                            {suggestedPrompts.map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => prompt.editable ? handleEditablePrompt(prompt.text) : sendSuggestedPrompt(prompt.text)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-200 rounded-full hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors text-left"
                                >
                                    {prompt.text}
                                    {prompt.editable && <PencilIcon className="w-3 h-3 text-slate-500 dark:text-gray-400 shrink-0" />}
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-gray-700 flex items-center gap-2 flex-shrink-0">
                        <textarea
                            ref={inputRef}
                            rows={1}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about my services..."
                            className="flex-1 bg-slate-100 dark:bg-[#2a2a2a] border border-slate-300 dark:border-gray-600 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 overflow-y-auto"
                            style={{ maxHeight: '120px', resize: 'none' }}
                            disabled={isLoading}
                            aria-label="Chat input"
                        />
                        <button type="submit" className="bg-sky-500 text-white rounded-lg p-2 hover:bg-sky-600 disabled:bg-slate-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed self-end" disabled={isLoading || !inputValue.trim()} aria-label="Send message">
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </div>

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-40 bg-sky-500 text-white rounded-full p-4 shadow-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-[#131314] focus:ring-sky-500 transition-transform transform hover:scale-110"
                    aria-label="Open chat"
                >
                    <ChatIcon />
                </button>
            )}
        </>
    );
};

export default Chatbot;