import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatIcon, SendIcon, XIcon, ShareIcon, SparkleIcon, CalculatorIcon } from './Icons';
import { Selections, initialSelections } from './pricing';

interface Message {
    role: 'user' | 'model';
    text: string;
    action?: 'pricing';
    showCalculatorCta?: boolean;
}

interface ChatbotProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    initialMessage: string;
    clearInitialMessage: () => void;
    onSelectionsChange: React.Dispatch<React.SetStateAction<Selections>>;
    setIsAiUpdating: (isUpdating: boolean) => void;
    setIsAiSuggestion: (isSuggestion: boolean) => void;
    setLastUserPrompt: (prompt: string) => void;
    setLastAiSuggestion: (selections: Selections | null) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ 
    isOpen, 
    setIsOpen, 
    initialMessage, 
    clearInitialMessage, 
    onSelectionsChange, 
    setIsAiUpdating, 
    setIsAiSuggestion, 
    setLastUserPrompt,
    setLastAiSuggestion
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const shareMenuRef = useRef<HTMLDivElement>(null);
    const hasSentWelcome = useRef(false);

    const systemInstruction = `You are 'Amir', a friendly and helpful AI assistant for Yusuf's frontend developer portfolio. Your goal is to be conversational and helpful. Keep your answers concise. You are knowledgeable about:
- Yusuf's skills: React, Next.js, TypeScript, Tailwind CSS, Node.js, Vercel, Docker.
- Yusuf's services: App Development, Frontend Development, eCommerce solutions.

**INTERNAL CALCULATION FORMULA & REFERENCE (All prices in NGN):**

**Your calculation MUST follow this formula precisely:**
Total = (Base Fee) + (Page Costs) + (Feature Costs)

**1. Base Fee (Always included):**
- Base Setup: 150000
- Responsive Development: 100000
- Design Cost: 100000 * (Selected Design Tier from 1-4)
- *The absolute minimum project cost is 350,000 (Base Setup + Responsive Dev + Tier 1 Design).*

**2. Page Costs (Add as needed):**
- Standard Page: 25000 per page
- Complex Page: 45000 per page
- System Page: 90000 per page

**3. Feature Costs (Add as needed):**
- CMS: 0 (None), 100000 (Headless), 250000 (Traditional)
- E-commerce: 300000 (base fee if products > 0) + (5000 * number of products)
- User Authentication: 120000
- Payment Gateway: 150000
- API Integrations: 100000 per API

**CURRENCY CONVERSION:**
- All primary calculations are in Nigerian Naira (NGN).
- If asked for a price in USD, you MUST use the conversion rate of **1 USD = 1550 NGN**. Do not use any other rate.

**IMPORTANT RULES:**

1.  **MAINTAIN CONTEXT:** Always treat the conversation as a single, continuous dialogue.

2.  **PRICING INTENT:**
    - If a user asks a general cost question (e.g., "What was the cost of the e-commerce project?"), answer it normally.
    - **Only if the user clearly wants a price estimate for THEIR OWN project** (e.g., "How much would my website cost?"), you MUST respond with ONLY the special command: \`[ACTION:PRICING]\`.

3.  **CALCULATOR ASSISTANCE FLOW:**
    - After you send \`[ACTION:PRICING]\`, the user will get options. If they choose "Please assist me here", your job is to gather their requirements conversationally.
    - Once you have enough information, summarize it and provide the special command to update the calculator. The format MUST be \`[CALCULATOR_JSON]:<JSON_OBJECT>\`. The JSON object must be a single line with no newlines.
    - **Example JSON command:** \`I've got the details... [CALCULATOR_JSON]:{"designTier":2,"standardPages":5}\`
    - The JSON keys must be: 'designTier', 'standardPages', 'complexPages', 'systemPages', 'cmsType' (values: '0', '100000', '250000'), 'products', 'userAuth', 'paymentGateway', 'apis'.

4.  **BUDGET OPTIMIZATION FLOW (CRITICAL):**
    - When a user provides a specific budget (e.g., "my budget is 500k"), you must use your internal calculation ability to find a suitable project scope. This is a multi-step internal process for you.
    - **Step 1: Acknowledge and Activate.** Your response MUST begin with the special command \`[ACTION:CALCULATING]\` on its own line.
    - **Step 2: Internal Iteration (Your Thought Process).**
        - Start with a reasonable baseline (e.g., Tier 1 design, a few pages).
        - Calculate the cost step-by-step using the **INTERNAL CALCULATION FORMULA**. Add up each component precisely as specified.
        - Compare the total to the user's budget.
        - If the cost is too high, remove or downgrade features (e.g., lower the design tier, reduce pages, remove user auth). If it's too low, add valuable features.
        - Repeat this calculation internally until you find a configuration that is close to, but not over, the user's budget.
    - **Step 3: Formulate Response.**
        - Once you have a final configuration, explain your reasoning to the user. Tell them what you included and why, to meet their budget. State the final calculated price.
    - **Step 4: Provide Final Command.** After your explanation, you MUST provide the final \`[CALCULATOR_JSON]:{...}\` command with the configuration you settled on.
    - **Example Full Response for Budget:**
      \`\`\`
      [ACTION:CALCULATING]
      
      Okay, working with a budget of ₦500,000. To make that work, I've put together a package that focuses on the essentials while still delivering a professional result. I've selected a Tier 1 (Template Customization) design and included 3 standard pages (like Home, About, Contact). Based on the formula, this comes to ₦425,000. This gives you a great starting point.
      
      [CALCULATOR_JSON]:{"designTier":1,"standardPages":3,"complexPages":0,"systemPages":0,"cmsType":"0","products":0,"userAuth":false,"paymentGateway":false,"apis":0}
      \`\`\`

5.  **SUGGESTING ALTERNATIVES:**
    - If a user asks for an "alternative", "different suggestion", or a "new suggestion" based on a current price or a previous suggestion, your goal is to re-run your internal calculation.
    - You MUST change the feature mix significantly. For example, trade a higher design tier for fewer pages, or add user auth by removing e-commerce. Don't just change page counts by one or two. Be creative with the trade-offs.
    - Acknowledge the request, perform the calculation (internally, using the same [ACTION:CALCULATING] process), explain the new trade-offs, and provide the final \`[CALCULATOR_JSON]\` command.

Do not make up information about projects or contact details not present on the site.`;

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
    }, [messages, isLoading, isCalculating]);
    
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

    const processFinalResponse = (text: string) => {
        let textForDisplay = text;
        let hasPricingAction = false;
        let hasCalculatorUpdate = false;
        let newSelectionsData: Selections | null = null;

        if (text.includes('[CALCULATOR_JSON]:')) {
            hasCalculatorUpdate = true;
            const parts = text.split('[CALCULATOR_JSON]:');
            textForDisplay = parts[0].trim();
            const jsonPart = parts[1].trim();
            try {
                const newSelections = JSON.parse(jsonPart);
                newSelectionsData = { ...initialSelections, ...newSelections };
            } catch (e) {
                console.error("Failed to parse calculator JSON:", e);
                textForDisplay = text;
            }
        }

        if (textForDisplay.trim() === '[ACTION:PRICING]') {
            hasPricingAction = true;
            textForDisplay = 'I can help with that. Would you like to go to the pricing calculator or have me adjust it for you based on our conversation?';
        }

        setMessages(prev => [...prev, {
            role: 'model',
            text: textForDisplay,
            ...(hasPricingAction && { action: 'pricing' }),
            ...(hasCalculatorUpdate && { showCalculatorCta: true })
        }]);

        if (hasCalculatorUpdate && newSelectionsData) {
            setIsAiSuggestion(true);
            onSelectionsChange(newSelectionsData);
            setLastAiSuggestion(newSelectionsData);
            // Auto-scroll on desktop, mobile has the button
            setTimeout(() => {
                document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    const sendMessageToAi = async (messageText: string) => {
        if (!chat) return;

        setIsLoading(true);
        try {
            const lowerCaseMessage = messageText.toLowerCase();
            if (lowerCaseMessage.includes('budget') || lowerCaseMessage.includes('cost') || lowerCaseMessage.includes('alternative') || lowerCaseMessage.includes('suggest')) {
                setLastUserPrompt(messageText);
            }

            const response = await chat.sendMessage({ message: messageText });
            const responseText = response.text;

            if (responseText.startsWith('[ACTION:CALCULATING]')) {
                setIsCalculating(true);
                setIsAiUpdating(true);
                document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
                setIsCalculating(false);
                
                const cleanedText = responseText.replace('[ACTION:CALCULATING]', '').trim();
                processFinalResponse(cleanedText);
                setTimeout(() => setIsAiUpdating(false), 500);
            } else {
                processFinalResponse(responseText);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
            setIsAiUpdating(false);
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
        if (!inputValue.trim() || isLoading || isCalculating) return;

        const userMessage: Message = { role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        const messageToSend = inputValue;
        setInputValue('');
        
        await sendMessageToAi(messageToSend);
    };

    const handlePricingAction = (choice: 'calculator' | 'assist') => {
        setMessages(prev => prev.filter(m => m.action !== 'pricing'));
        
        if (choice === 'calculator') {
            document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
            setIsOpen(false);
        } else {
            const userMessage: Message = { role: 'user', text: "Please assist me here." };
            setMessages(prev => [...prev, userMessage]);
            sendMessageToAi("Please assist me here.");
        }
    };

    const handleCheckCalculator = () => {
        setIsOpen(false);
        setTimeout(() => {
            document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
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
                                {msg.action === 'pricing' && (
                                    <div className="mt-3 border-t border-gray-600 pt-3 flex flex-col gap-2">
                                        <button onClick={() => handlePricingAction('calculator')} className="w-full text-left bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-3 rounded-md text-sm transition-colors">
                                            Go to Calculator
                                        </button>
                                        <button onClick={() => handlePricingAction('assist')} className="w-full text-left bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-3 rounded-md text-sm transition-colors">
                                            Assist me here
                                        </button>
                                    </div>
                                )}
                                {msg.showCalculatorCta && (
                                    <div className="mt-3 border-t border-gray-600 pt-3 md:hidden">
                                        <button 
                                            onClick={handleCheckCalculator} 
                                            className="w-full text-left bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CalculatorIcon className="w-4 h-4" />
                                            <span>View on Calculator</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && !isCalculating && (
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
                    {isCalculating && (
                        <div className="flex justify-start">
                            <div className="bg-gray-700 text-gray-200 rounded-2xl px-4 py-2">
                                <div className="flex items-center space-x-2 text-sm">
                                    <SparkleIcon />
                                    <span>Calculating...</span>
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
                        disabled={isLoading || isCalculating}
                        aria-label="Chat input"
                    />
                    <button type="submit" className="bg-sky-500 text-white rounded-lg p-2 hover:bg-sky-600 disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={isLoading || isCalculating || !inputValue.trim()} aria-label="Send message">
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