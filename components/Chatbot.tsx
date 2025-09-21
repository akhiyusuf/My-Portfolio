import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatIcon, SendIcon, XIcon, ShareIcon } from './Icons';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface ChatbotProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    initialMessage: string;
    clearInitialMessage: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, setIsOpen, initialMessage, clearInitialMessage }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const shareMenuRef = useRef<HTMLDivElement>(null);
    const hasSentWelcome = useRef(false);

    const systemInstruction = "You are a helpful AI assistant for Yusuf's portfolio website. Your name is 'Amir'. You are friendly and knowledgeable about frontend development, Yusuf's skills (React, Next.js, TypeScript, Tailwind CSS, Node.js, Vercel, Docker), and the services he offers (App Development, Frontend Development, eCommerce solutions). If a user asks about pricing, cost, or wants an estimate, you should direct them to the 'Instant Project Estimate' calculator on the page. You can also receive project scopes directly from the calculator. When you receive a scope, acknowledge it and ask clarifying questions or offer next steps. Keep your answers concise and helpful. Do not make up information about projects or contact details not present on the site.";

    useEffect(() => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const chatSession = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
            });
            setChat(chatSession);
        } catch (error) {
            console.error("Failed to initialize Gemini AI:", error);
            setMessages([{ role: 'model', text: 'Sorry, I am unable to connect right now.' }]);
        }
    }, []);

    useEffect(() => {
        if (isOpen && !hasSentWelcome.current && chat && messages.length === 0) {
            hasSentWelcome.current = true;
            setMessages([{ role: 'model', text: "Hi! I'm Amir, an AI assistant. How can I help you learn more about Yusuf's work?" }]);
        }
    }, [isOpen, chat, messages]);

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
        if (!chat) return;

        setIsLoading(true);
        try {
            const responseStream = await chat.sendMessageStream({ message: messageText });
            let currentResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of responseStream) {
                currentResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', text: currentResponse };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initialMessage && chat) {
            const userMessage: Message = { role: 'user', text: initialMessage };
            setMessages(prev => [...prev, userMessage]);
            sendMessageToAi(initialMessage);
            clearInitialMessage();
        }
    }, [initialMessage, chat]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        const messageToSend = inputValue;
        setInputValue('');
        
        await sendMessageToAi(messageToSend);
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


    return (
        <>
            <div 
                className={`fixed z-50 bg-[#1a1a1a] flex flex-col transition-all duration-300 ease-in-out shadow-2xl
                    inset-0 border-0 rounded-none
                    md:inset-auto md:bottom-24 md:right-6 md:w-full md:max-w-sm md:h-[70vh] md:max-h-[600px] md:rounded-2xl md:border md:border-gray-800
                    ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`
                } 
                role="dialog" 
                aria-modal="true" 
                aria-hidden={!isOpen}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-lg font-medium text-white">AI Assistant</h2>
                    <div className="flex items-center gap-2">
                        {messages.length > 1 && (
                            <div className="relative" ref={shareMenuRef}>
                                <button 
                                    onClick={() => setIsShareMenuOpen(prev => !prev)} 
                                    className="text-gray-400 hover:text-white" 
                                    aria-label="Share or export chat"
                                    aria-haspopup="true"
                                    aria-expanded={isShareMenuOpen}
                                >
                                    <ShareIcon />
                                </button>
                                {isShareMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#2a2a2a] border border-gray-700 rounded-md shadow-lg z-10 py-1 animate-fade-in-scale">
                                        <button onClick={handlePrint} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors">Print / Save as PDF</button>
                                        <button onClick={handleCopyToClipboard} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors">Copy to Clipboard</button>
                                        <button onClick={handleDownloadText} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors">Download as .txt File</button>
                                    </div>
                                )}
                            </div>
                        )}
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white" aria-label="Close chat">
                            <XIcon />
                        </button>
                    </div>
                </header>

                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-2xl px-4 py-2 max-w-xs break-words ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                             <div className="bg-gray-700 text-gray-200 rounded-2xl px-4 py-2">
                                <div className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                                </div>
                             </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 flex items-center gap-2 flex-shrink-0">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1 bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        disabled={isLoading}
                        aria-label="Chat input"
                    />
                    <button type="submit" className="bg-sky-500 text-white rounded-lg p-2 hover:bg-sky-600 disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={isLoading || !inputValue.trim()} aria-label="Send message">
                        <SendIcon />
                    </button>
                </form>
            </div>

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-40 bg-sky-500 text-white rounded-full p-4 shadow-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#131314] focus:ring-sky-500 transition-transform transform hover:scale-110"
                    aria-label="Open chat"
                >
                    <ChatIcon />
                </button>
            )}
        </>
    );
};

export default Chatbot;