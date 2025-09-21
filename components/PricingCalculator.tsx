import React, { useState, useEffect, useMemo } from 'react';
import { CalculatorIcon, SparkleIcon } from './Icons';

// --- Reusable Sub-components ---

interface OptionRowProps {
    name: string;
    price: string;
    children: React.ReactNode;
}
const OptionRow: React.FC<OptionRowProps> = ({ name, price, children }) => (
    <div className="py-4">
        <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-300">{name}</span>
            <span className="text-sky-400 font-mono text-sm">{price}</span>
        </div>
        {children}
    </div>
);

interface SliderInputProps {
    value: number;
    onChange: (value: number) => void;
    max?: number;
}
const SliderInput: React.FC<SliderInputProps> = ({ value, onChange, max = 20 }) => (
    <div className="flex items-center gap-4">
        <input
            type="range"
            min="0"
            max={max}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />
        <span className="bg-[#2a2a2a] text-white text-sm font-semibold w-12 text-center py-1 rounded-md">{value}</span>
    </div>
);

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-sky-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
    </label>
);

// --- Main Pricing Calculator Component ---

const PRICING = {
    baseSetup: 150000,
    designTierMultiplier: 100000,
    responsiveDev: 100000,
    standardPage: 25000,
    complexPage: 45000,
    systemPage: 90000,
    ecommerceBase: 300000,
    product: 5000,
    userAuth: 120000,
    paymentGateway: 150000,
    apiIntegration: 100000,
    cms: { "0": 0, "100000": 100000, "250000": 250000 }
};

const initialSelections = {
    designTier: 1,
    standardPages: 3,
    complexPages: 0,
    systemPages: 0,
    cmsType: "0",
    products: 0,
    userAuth: false,
    paymentGateway: false,
    apis: 0
};

type Selections = typeof initialSelections;

interface PricingCalculatorProps {
    onDiscussWithAI: (scopeSummary: string) => void;
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({ onDiscussWithAI }) => {
    const [selections, setSelections] = useState<Selections>(initialSelections);
    const [currency, setCurrency] = useState('ngn');
    
    const updateSelection = <K extends keyof Selections>(key: K, value: Selections[K]) => {
        setSelections(prev => ({ ...prev, [key]: value }));
    };

    const formatCurrency = (amount: number, curr: string) => {
        const usdRate = 1550;
        if (curr === 'ngn') {
            return `₦${amount.toLocaleString('en-US')}`;
        }
        return `$${(amount / usdRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const totalCost = useMemo(() => {
        let total = PRICING.baseSetup + PRICING.responsiveDev;
        total += PRICING.designTierMultiplier * selections.designTier;
        total += PRICING.standardPage * selections.standardPages;
        total += PRICING.complexPage * selections.complexPages;
        total += PRICING.systemPage * selections.systemPages;
        total += PRICING.cms[selections.cmsType as keyof typeof PRICING.cms];
        if (selections.products > 0) total += PRICING.ecommerceBase;
        total += PRICING.product * selections.products;
        if (selections.userAuth) total += PRICING.userAuth;
        if (selections.paymentGateway) total += PRICING.paymentGateway;
        total += PRICING.apiIntegration * selections.apis;
        return total;
    }, [selections]);

    const milestones = useMemo(() => {
        const structure = [
            { phase: "Initial Deposit (20%)", description: "Project kickoff & discovery" },
            { phase: "Design Approval (25%)", description: "Final UI/UX wireframes" },
            { phase: "Development Complete (35%)", description: "Core features implemented" },
            { phase: "Final Delivery (20%)", description: "Deployment & handover" }
        ];
        const percentages = [0.20, 0.25, 0.35, 0.20];
        return structure.map((item, index) => ({
            ...item,
            amount: totalCost * percentages[index]
        }));
    }, [totalCost]);

    const handleDiscuss = () => {
        const designTiers: { [key: number]: string } = { 1: "Template Customization", 2: "Custom Design", 3: "Premium Custom", 4: "Enterprise-grade" };
        const cmsTypes: { [key: string]: string } = { "0": "None", "100000": "Headless CMS", "250000": "Traditional CMS" };

        let summary = "Hello Amir, I've used the calculator to create a project estimate. Here's the scope:\n";
        summary += `- Design Tier: ${designTiers[selections.designTier]}\n`;
        if (selections.standardPages > 0) summary += `- Standard Pages: ${selections.standardPages}\n`;
        if (selections.complexPages > 0) summary += `- Complex Pages: ${selections.complexPages}\n`;
        if (selections.systemPages > 0) summary += `- System Pages: ${selections.systemPages}\n`;
        if (selections.cmsType !== "0") summary += `- CMS: ${cmsTypes[selections.cmsType]}\n`;
        if (selections.products > 0) summary += `- E-commerce Products: ${selections.products}\n`;
        
        const features = [];
        if (selections.userAuth) features.push("User Authentication");
        if (selections.paymentGateway) features.push("Payment Gateway");
        if (features.length > 0) summary += `- Additional Features: ${features.join(', ')}\n`;
        
        if (selections.apis > 0) summary += `- API Integrations: ${selections.apis}\n`;
        summary += `\nThe estimated total is ${formatCurrency(totalCost, currency)}. Can we discuss this further?`;
        
        onDiscussWithAI(summary);
    };

    return (
        <section className="py-24">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-medium text-white tracking-tight flex items-center justify-center gap-3">
                    <CalculatorIcon /> Instant Project Estimate
                </h2>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">Use this calculator to get a ballpark figure for your project. Prices are estimates and may vary.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
                {/* Options Panel */}
                <div className="lg:col-span-3 bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 divide-y divide-gray-800">
                    <h3 className="text-2xl font-medium text-white pb-4">Project Features</h3>
                    
                    <OptionRow name="Design Tier" price={`×${selections.designTier} of base`}>
                        <select value={selections.designTier} onChange={e => updateSelection('designTier', parseInt(e.target.value))} className="w-full bg-[#2a2a2a] border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                            <option value={1}>Tier 1: Template Customization</option>
                            <option value={2}>Tier 2: Custom Design</option>
                            <option value={3}>Tier 3: Premium Custom</option>
                            <option value={4}>Tier 4: Enterprise-grade</option>
                        </select>
                    </OptionRow>

                    <OptionRow name="Standard Pages (e.g., Home, About)" price={formatCurrency(PRICING.standardPage, 'ngn') + '/page'}>
                        <SliderInput value={selections.standardPages} onChange={v => updateSelection('standardPages', v)} />
                    </OptionRow>

                    <OptionRow name="Complex Pages (e.g., Dashboard)" price={formatCurrency(PRICING.complexPage, 'ngn') + '/page'}>
                        <SliderInput value={selections.complexPages} onChange={v => updateSelection('complexPages', v)} />
                    </OptionRow>
                    
                    <OptionRow name="System Pages (e.g., Auth)" price={formatCurrency(PRICING.systemPage, 'ngn') + '/page'}>
                        <SliderInput value={selections.systemPages} onChange={v => updateSelection('systemPages', v)} max={5} />
                    </OptionRow>

                    <OptionRow name="Content Management (CMS)" price={selections.cmsType !== "0" ? "One-time" : "None"}>
                       <select value={selections.cmsType} onChange={e => updateSelection('cmsType', e.target.value)} className="w-full bg-[#2a2a2a] border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                            <option value="0">None</option>
                            <option value="100000">Headless CMS (e.g., Sanity)</option>
                            <option value="250000">Traditional CMS (e.g., WordPress)</option>
                        </select>
                    </OptionRow>

                    <OptionRow name="Number of Products (for E-commerce)" price={formatCurrency(PRICING.product, 'ngn') + '/product'}>
                        <SliderInput value={selections.products} onChange={v => updateSelection('products', v)} max={200} />
                    </OptionRow>

                    <OptionRow name="User Authentication" price={formatCurrency(PRICING.userAuth, 'ngn')}>
                        <ToggleSwitch checked={selections.userAuth} onChange={v => updateSelection('userAuth', v)} />
                    </OptionRow>

                     <OptionRow name="Payment Gateway" price={formatCurrency(PRICING.paymentGateway, 'ngn')}>
                        <ToggleSwitch checked={selections.paymentGateway} onChange={v => updateSelection('paymentGateway', v)} />
                    </OptionRow>

                    <OptionRow name="External API Integrations" price={formatCurrency(PRICING.apiIntegration, 'ngn') + '/API'}>
                        <SliderInput value={selections.apis} onChange={v => updateSelection('apis', v)} max={10} />
                    </OptionRow>
                </div>

                {/* Summary Panel */}
                <div className="lg:col-span-2 bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 h-fit sticky top-24">
                    <h3 className="text-2xl font-medium text-white pb-4 border-b border-gray-800">Estimate Summary</h3>
                    
                    <div className="my-4">
                        <div className="flex bg-[#2a2a2a] p-1 rounded-md text-sm">
                            <button onClick={() => setCurrency('ngn')} className={`w-1/2 py-2 rounded ${currency === 'ngn' ? 'bg-[#3a3a3a] text-white' : 'text-gray-400'}`}>NGN</button>
                            <button onClick={() => setCurrency('usd')} className={`w-1/2 py-2 rounded ${currency === 'usd' ? 'bg-[#3a3a3a] text-white' : 'text-gray-400'}`}>USD</button>
                        </div>
                    </div>
                    
                    <div className="text-center my-6">
                        <p className="text-gray-400 text-sm">Total Estimated Cost</p>
                        <p className="text-5xl font-bold text-white tracking-tight">{formatCurrency(totalCost, currency)}</p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Payment Milestones</h4>
                        <div className="text-sm text-gray-400">
                            {milestones.map(m => (
                                <div key={m.phase} className="flex justify-between items-center py-2 border-b border-gray-800/50">
                                    <span>{m.phase}</span>
                                    <span className="font-mono text-gray-300">{formatCurrency(m.amount, currency)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center space-x-2">
                         <button onClick={() => setSelections(initialSelections)} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
                            Reset
                        </button>
                         <button onClick={handleDiscuss} className="w-full flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
                            <SparkleIcon />
                            <span>Discuss with AI</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingCalculator;