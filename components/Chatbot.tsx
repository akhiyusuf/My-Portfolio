import React, { useState, useEffect, useRef } from 'react';
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
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const shareMenuRef = useRef<HTMLDivElement>(null);
    const hasSentWelcome = useRef(false);

    const systemInstruction = `You are 'Amir', a friendly and helpful AI assistant for Yusuf's frontend developer portfolio. Your goal is to be conversational and helpful. Keep your answers concise. You are knowledgeable about:
- Yusuf's skills: React, Next.js, TypeScript, Tailwind CSS, Node.js, Vercel, Docker.
- Yusuf's services: App Development, Frontend Development, eCommerce solutions.

**CRITICAL RULE: THE INVISIBLE CALCULATOR & SELF-VERIFICATION**
You have an internal, invisible calculator that is a perfect, error-free copy of the main on-screen calculator. You MUST use this for any budget or alternative calculations. You cannot "estimate"; you must calculate precisely using a rigorous, self-verifying internal monologue.

**INTERNAL CALCULATION FORMULA & REFERENCE (All prices in NGN):**
The total cost is the SUM of all the following components that apply:
- **Base Fee**: 250,000 (This is always included)
- **Design Tier Cost**: 100,000 * the selected tier (1, 2, 3, or 4)
- **Standard Pages Cost**: 25,000 * number of pages
- **Complex Pages Cost**: 45,000 * number of pages
- **System Pages Cost**: 90,000 * number of pages
- **CMS Cost**: 0 for None, 100,000 for Headless, 250,000 for Traditional
- **E-commerce Cost**: 300,000 base fee (only if products > 0) PLUS 5,000 * number of products
- **User Authentication Cost**: 120,000 (if selected)
- **Payment Gateway Cost**: 150,000 (if selected)
- **API Integrations Cost**: 100,000 * number of integrations

---

**RESPONSE RULES & FLOWS**

**1. GENERAL CONVERSATION:** Be friendly and answer questions based on Yusuf's skills and services.

**2. PRICING INTENT:**
- If a user wants a price for THEIR OWN project (e.g., "How much would my website cost?"), you MUST respond with ONLY the special command: \`[ACTION:PRICING]\`.

**3. CALCULATOR ASSISTANCE FLOW:**
- If the user chooses "Assist me here", gather their requirements conversationally.
- Once you have enough info, summarize it and provide the command to update the calculator. The format MUST be \`[CALCULATOR_JSON]:<JSON_OBJECT>\`. The JSON object must be a single line with no newlines. All JSON keys MUST be in double quotes.
- Example: \`I've got the details... [CALCULATOR_JSON]:{"designTier":2,"standardPages":5,"userAuth":false}\`
- Valid JSON keys/types: "designTier"(number), "standardPages"(number), "complexPages"(number), "systemPages"(number), "cmsType"(string: "0", "100000", "250000"), "products"(number), "userAuth"(boolean), "paymentGateway"(boolean), "apis"(number).

**4. BUDGETS & ALTERNATIVES (THE "CALCULATING" MODE):**
- This is your most important task. When a user provides a budget or asks for an alternative, you MUST use the following rigorous, iterative process.

- **Step A: Acknowledge & Trigger UI:** Your response MUST begin with the special command \`[ACTION:CALCULATING]\` on its own line. This tells the user you are "thinking".

- **Step B: Internal Monologue (Your "Invisible Calculator" Session):**
    - You will now perform a "Chain of Thought" analysis. You MUST wrap this entire internal monologue, including all your calculation attempts and final verification, inside special tags: \`<internal_monologue>...\</internal_monologue>\`.
    - **This content will be stripped out and is for your eyes only.**
    - Inside these tags, your monologue MUST follow this structure:
        - **1. Goal Definition:** State the user's goal. (e.g., "Goal: Find a configuration for a ₦800,000 budget."). If the budget is in USD, state the conversion (1 USD = 1550 NGN) and use NGN for all calculations.
        - **2. Iterative Search:** Try different combinations of Tiers, Pages, and Features. For EACH attempt, write down the full calculation (summing all components from the formula list) and the resulting total. (e.g., "Attempt 1: Base (250k) + Tier 2 (200k) + 5 Pages (125k) = 575k. Result: Too low."). Continue until you find a satisfactory combination that gets as close as possible to the user's budget without exceeding it.
        - **3. Final Verification:** This is a MANDATORY step. Once you have a final configuration, perform the calculation one last time to get the exact total. You must lay it out clearly.
            - Example:
              \`FINAL VERIFICATION:
              - Configuration: { "designTier": 2, "standardPages": 10, ... }
              - Calculation: 250000 (Base) + 200000 (Tier 2) + 250000 (10 Std Pages) = 700000.
              - Confirmed Total: 700000.\`

- **Step C: Formulate Final User-Facing Response:**
    - After your internal monologue is complete, formulate the response for the user.
    - This user-facing response MUST be OUTSIDE the \`<internal_monologue>\` tags.
    - The natural language explanation AND the \`[CALCULATOR_JSON]:{...}\` command MUST be generated SOLELY from the data in your "Final Verification" step. This ensures perfect consistency.

**5. FINAL OUTPUT EXAMPLE (ABSOLUTELY CRITICAL):**
- Your final raw output must look like this. A hidden monologue followed by a clean, visible message.
- **CORRECT FORMAT:**
\`<internal_monologue>
Goal: Find config for ₦700k.
Attempt 1: ... too low.
FINAL VERIFICATION: ... Confirmed Total: 700000.
</internal_monologue>
Okay, I have a suggestion that fits your budget. It includes a Tier 2 design and 10 standard pages for a total of ₦700,000. [CALCULATOR_JSON]:{"designTier":2,"standardPages":10, ...}\`
- **DO NOT** let any of your calculations, attempts, or words like "Verification" appear in the final message to the user.
`;

    useEffect(() => {
        if (isOpen && !hasSentWelcome.current && messages.length === 0) {
            hasSentWelcome.current = true;
            setMessages([{ role: 'model', text: "Hi! I'm Amir, an AI assistant. How can I help you learn more about Yusuf's work?" }]);
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
        const cleanedTextForDisplay = text.replace(/<internal_monologue>[\s\S]*?<\/internal_monologue>/g, '').trim();

        let textForDisplay = cleanedTextForDisplay;
        let hasPricingAction = false;
        let hasCalculatorUpdate = false;
        let newSelectionsData: Selections | null = null;

        if (textForDisplay.includes('[CALCULATOR_JSON]:')) {
            hasCalculatorUpdate = true;
            const parts = textForDisplay.split('[CALCULATOR_JSON]:');
            textForDisplay = parts[0].trim();
            const potentialJsonPart = parts[1];

            const jsonStartIndex = potentialJsonPart.indexOf('{');
            const jsonEndIndex = potentialJsonPart.lastIndexOf('}');
            
            if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
                const jsonString = potentialJsonPart.substring(jsonStartIndex, jsonEndIndex + 1);
                try {
                    const newSelections = JSON.parse(jsonString);
                    newSelectionsData = { ...initialSelections, ...newSelections };

                    const trailingText = potentialJsonPart.substring(jsonEndIndex + 1).trim();
                    if (trailingText) {
                        textForDisplay += ` ${trailingText}`;
                    }

                } catch (e) {
                    console.error("Failed to parse calculator JSON:", e, "Raw JSON:", jsonString);
                    textForDisplay = "I seem to have run into a small issue with formatting my response. Could you try asking that again?";
                }
            } else {
                console.error("Could not find a valid JSON object after [CALCULATOR_JSON]:", potentialJsonPart);
                textForDisplay = "I had trouble generating the calculator configuration. Let's try that again.";
            }
        }

        if (textForDisplay.trim() === '[ACTION:PRICING]') {
            hasPricingAction = true;
            textForDisplay = 'I can help with that. Would you like to go to the pricing calculator or have me adjust it for you based on our conversation?';
        }
        
        if (!textForDisplay) {
            textForDisplay = "Sorry, I seem to be having trouble connecting. Please check your connection or try again in a moment.";
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
            setTimeout(() => {
                document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    const sendMessageToAi = async (messageText: string) => {
        setIsLoading(true);
        
        const lowerCaseMessage = messageText.toLowerCase();
        if (lowerCaseMessage.includes('budget') || lowerCaseMessage.includes('cost') || lowerCaseMessage.includes('alternative') || lowerCaseMessage.includes('suggest')) {
            setLastUserPrompt(messageText);
        }

        const url = 'https://api.hyperbolic.xyz/v1/chat/completions';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJha2hpeXV1c3VmQGdtYWlsLmNvbSIsImlhdCI6MTczNTQ4NDEyNn0.qRWbP9v1ydn3_6sOfid4cKNrgXkeJtxePGPJ0HvKpSI'
        };

        const apiMessages = [
            { role: 'system', content: systemInstruction },
            ...messages.map(msg => ({
                role: msg.role === 'model' ? 'assistant' : 'user',
                content: msg.text
            })),
            { role: 'user', content: messageText }
        ];

        const body = {
            model: 'deepseek-ai/DeepSeek-V3-0324',
            messages: apiMessages,
            max_tokens: 4096, 
            temperature: 0.2,
            top_p: 0.8,
            stream: false
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const json = await response.json();
            const responseText = json.choices[0]?.message?.content || '';

            if (responseText.trim().startsWith('[ACTION:CALCULATING]')) {
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
        if (initialMessage) {
            const userMessage: Message = { role: 'user', text: initialMessage };
            setMessages(prev => [...prev, userMessage]);
            sendMessageToAi(initialMessage);
            clearInitialMessage();
        }
    }, [initialMessage]);

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