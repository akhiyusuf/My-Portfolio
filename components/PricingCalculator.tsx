import React, { useState, useMemo, useEffect } from 'react';
import { CalculatorIcon, ResetIcon, ChevronDownIcon, MagicWandIcon } from './Icons';
import { Selections, initialSelections, calculateTotalCost, PRICING } from './pricing';

// --- Reusable Sub-components ---

interface OptionRowProps {
    name: string;
    price: string;
    children: React.ReactNode;
    fullWidth?: boolean;
}
const OptionRow: React.FC<OptionRowProps> = ({ name, price, children, fullWidth = false }) => (
    <div className={`py-3 ${fullWidth ? 'col-span-2' : ''}`}>
        <div className="flex flex-wrap justify-between items-baseline gap-x-2 mb-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>
            <span className="text-sky-500 dark:text-sky-400 font-mono text-sm flex-shrink-0">{price}</span>
        </div>
        {children}
    </div>
);


interface CounterInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}
const CounterInput: React.FC<CounterInputProps> = ({ value, onChange, min = 0, max = 20 }) => {
    const handleDecrement = () => onChange(Math.max(min, value - 1));
    const handleIncrement = () => onChange(Math.min(max, value + 1));

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={value <= min}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrement"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/></svg>
                </button>
                <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={value >= max}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Increment"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>
                </button>
            </div>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white text-sm font-semibold w-16 text-center py-1.5 rounded-md tabular-nums">{value}</span>
        </div>
    );
};

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-sky-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
    </label>
);

// --- Main Pricing Calculator Component ---
interface PricingCalculatorProps {
    selections: Selections;
    onSelectionsChange: React.Dispatch<React.SetStateAction<Selections>>;
    onDiscussWithAi: (summary: string) => void;
}

const formatCurrencyStatic = (amount: number, curr: string) => {
    const usdRate = 1550;
    if (curr === 'ngn') {
        return `₦${amount.toLocaleString('en-US')}`;
    }
    return `$${(amount / usdRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// --- Feature Control Components (to avoid duplication) ---
interface FeatureControlsProps {
    selections: Selections;
    updateSelection: <K extends keyof Selections>(key: K, value: Selections[K]) => void;
}

const FeatureControls: React.FC<FeatureControlsProps> = ({ selections, updateSelection }) => (
    <div className="space-y-3">
        {/* Row 1: Design Tier (Full Width) */}
        <div className="pt-2">
            <OptionRow name="Design Tier" price={`×${selections.designTier} of base`}>
                <select value={selections.designTier} onChange={e => updateSelection('designTier', parseInt(e.target.value))} className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                    <option value={1}>Tier 1: Template Customization</option>
                    <option value={2}>Tier 2: Custom Design</option>
                    <option value={3}>Tier 3: Premium Custom</option>
                    <option value={4}>Tier 4: Enterprise-grade</option>
                </select>
            </OptionRow>
        </div>
        
        {/* Row 2: Page Sliders (Two Columns) */}
        <div className="grid grid-cols-2 items-start relative">
             <div className="pr-4">
                <OptionRow name="Standard Pages" price={formatCurrencyStatic(PRICING.standardPage, 'ngn') + '/p'}>
                    <CounterInput value={selections.standardPages} onChange={v => updateSelection('standardPages', v)} />
                </OptionRow>
            </div>
             <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800"></div>
            <div className="pl-4">
                <OptionRow name="Complex Pages" price={formatCurrencyStatic(PRICING.complexPage, 'ngn') + '/p'}>
                    <CounterInput value={selections.complexPages} onChange={v => updateSelection('complexPages', v)} />
                </OptionRow>
            </div>
        </div>

        {/* Row 3: Other Sliders (Two Columns) */}
        <div className="grid grid-cols-2 items-start relative">
             <div className="pr-4">
                <OptionRow name="System Pages" price={formatCurrencyStatic(PRICING.systemPage, 'ngn') + '/p'}>
                    <CounterInput value={selections.systemPages} onChange={v => updateSelection('systemPages', v)} max={5} />
                </OptionRow>
            </div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800"></div>
            <div className="pl-4">
                 <OptionRow name="API Integrations" price={formatCurrencyStatic(PRICING.apiIntegration, 'ngn') + '/API'}>
                    <CounterInput value={selections.apis} onChange={v => updateSelection('apis', v)} max={10} />
                </OptionRow>
            </div>
        </div>

        {/* Row 4: CMS (Full Width) */}
         <div>
            <OptionRow name="Content Management (CMS)" price={selections.cmsType !== "0" ? "One-time" : "None"}>
                <select value={selections.cmsType} onChange={e => updateSelection('cmsType', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                    <option value="0">None</option>
                    <option value="100000">Headless CMS (e.g., Sanity)</option>
                    <option value="250000">Traditional CMS (e.g., WordPress)</option>
                </select>
            </OptionRow>
        </div>
        
        {/* Row 5: E-commerce (Full Width) */}
        <div>
            <OptionRow name="Number of Products (for E-commerce)" price={formatCurrencyStatic(PRICING.product, 'ngn') + '/prod'}>
                <CounterInput value={selections.products} onChange={v => updateSelection('products', v)} max={200} />
            </OptionRow>
        </div>

        {/* Row 6: Toggles (Two Columns) */}
         <div className="grid grid-cols-2 items-start relative pt-2">
            <div className="pr-4">
                <OptionRow name="User Authentication" price={formatCurrencyStatic(PRICING.userAuth, 'ngn')}>
                    <ToggleSwitch checked={selections.userAuth} onChange={v => updateSelection('userAuth', v)} />
                </OptionRow>
            </div>
             <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800"></div>
            <div className="pl-4">
                <OptionRow name="Payment Gateway" price={formatCurrencyStatic(PRICING.paymentGateway, 'ngn')}>
                    <ToggleSwitch checked={selections.paymentGateway} onChange={v => updateSelection('paymentGateway', v)} />
                </OptionRow>
            </div>
        </div>
    </div>
);


const CoreFeaturesControls: React.FC<FeatureControlsProps> = ({ selections, updateSelection }) => (
    <>
        <OptionRow name="Design Tier" price={`×${selections.designTier} of base`} fullWidth>
            <select value={selections.designTier} onChange={e => updateSelection('designTier', parseInt(e.target.value))} className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                <option value={1}>Tier 1: Template Customization</option>
                <option value={2}>Tier 2: Custom Design</option>
                <option value={3}>Tier 3: Premium Custom</option>
                <option value={4}>Tier 4: Enterprise-grade</option>
            </select>
        </OptionRow>
        <OptionRow name="Standard Pages" price={formatCurrencyStatic(PRICING.standardPage, 'ngn') + '/p'}>
            <CounterInput value={selections.standardPages} onChange={v => updateSelection('standardPages', v)} />
        </OptionRow>
        <OptionRow name="Complex Pages" price={formatCurrencyStatic(PRICING.complexPage, 'ngn') + '/p'}>
            <CounterInput value={selections.complexPages} onChange={v => updateSelection('complexPages', v)} />
        </OptionRow>
        <OptionRow name="System Pages" price={formatCurrencyStatic(PRICING.systemPage, 'ngn') + '/p'}>
            <CounterInput value={selections.systemPages} onChange={v => updateSelection('systemPages', v)} max={5} />
        </OptionRow>
    </>
);

const AdvancedFeaturesControls: React.FC<FeatureControlsProps> = ({ selections, updateSelection }) => (
    <>
        <OptionRow name="API Integrations" price={formatCurrencyStatic(PRICING.apiIntegration, 'ngn') + '/API'}>
            <CounterInput value={selections.apis} onChange={v => updateSelection('apis', v)} max={10} />
        </OptionRow>
        <OptionRow name="Content Management (CMS)" price={selections.cmsType !== "0" ? "One-time" : "None"} fullWidth>
            <select value={selections.cmsType} onChange={e => updateSelection('cmsType', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                <option value="0">None</option>
                <option value="100000">Headless CMS (e.g., Sanity)</option>
                <option value="250000">Traditional CMS (e.g., WordPress)</option>
            </select>
        </OptionRow>
        <OptionRow name="Number of Products (for E-commerce)" price={formatCurrencyStatic(PRICING.product, 'ngn') + '/prod'} fullWidth>
            <CounterInput value={selections.products} onChange={v => updateSelection('products', v)} max={200} />
        </OptionRow>
        <OptionRow name="User Authentication" price={formatCurrencyStatic(PRICING.userAuth, 'ngn')}>
            <ToggleSwitch checked={selections.userAuth} onChange={v => updateSelection('userAuth', v)} />
        </OptionRow>
        <OptionRow name="Payment Gateway" price={formatCurrencyStatic(PRICING.paymentGateway, 'ngn')}>
            <ToggleSwitch checked={selections.paymentGateway} onChange={v => updateSelection('paymentGateway', v)} />
        </OptionRow>
    </>
);


const PricingCalculator: React.FC<PricingCalculatorProps> = ({ 
    selections, 
    onSelectionsChange, 
    onDiscussWithAi,
}) => {
    const [currency, setCurrency] = useState('ngn');
    const [mobileView, setMobileView] = useState<'options' | 'summary'>('options');
    const [mobileFeatureSection, setMobileFeatureSection] = useState<'core' | 'advanced'>('core');
    const [openSections, setOpenSections] = useState<string[]>(['core', 'advanced']);

    const toggleSection = (sectionId: string) => {
        setOpenSections(prev => 
            prev.includes(sectionId) 
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const updateSelection = <K extends keyof Selections>(key: K, value: Selections[K]) => {
        onSelectionsChange(prev => ({ ...prev, [key]: value }));
    };

    const formatCurrency = (amount: number, curr: string) => {
        return formatCurrencyStatic(amount, curr);
    };

    const totalCost = useMemo(() => calculateTotalCost(selections), [selections]);

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

    const handleReset = () => {
        onSelectionsChange(initialSelections);
    };

    const generateSelectionsSummary = (): string => {
        const summaryLines: string[] = [];
        summaryLines.push(`- Design Tier: ${selections.designTier}`);
        if (selections.standardPages > 0) summaryLines.push(`- Standard Pages: ${selections.standardPages}`);
        if (selections.complexPages > 0) summaryLines.push(`- Complex Pages: ${selections.complexPages}`);
        if (selections.systemPages > 0) summaryLines.push(`- System Pages: ${selections.systemPages}`);
        if (selections.cmsType !== "0") {
            const cmsName = selections.cmsType === "100000" ? "Headless" : "Traditional";
            summaryLines.push(`- CMS: ${cmsName}`);
        }
        if (selections.products > 0) summaryLines.push(`- E-commerce Products: ${selections.products}`);
        if (selections.userAuth) summaryLines.push(`- User Authentication: Included`);
        if (selections.paymentGateway) summaryLines.push(`- Payment Gateway: Included`);
        if (selections.apis > 0) summaryLines.push(`- API Integrations: ${selections.apis}`);
        
        return summaryLines.join('\n');
    };

    const handleDiscussClick = () => {
        const summary = generateSelectionsSummary();
        const totalCostFormatted = formatCurrency(totalCost, 'ngn');
        const message = `I've configured the project calculator and got an estimate of ${totalCostFormatted}. Here are my selections, can we discuss them?\n\n${summary}`;
        onDiscussWithAi(message);
    };
    
    const featureControlsProps = { selections, updateSelection };

    return (
        <section className="py-24">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-medium text-gray-900 dark:text-white tracking-tight flex items-center justify-center gap-3">
                    <CalculatorIcon /> Instant Project Estimate
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">Use this calculator to get a ballpark figure for your project. Prices are estimates and may vary.</p>
            </div>

             {/* MOBILE-ONLY STICKY HEADER */}
            <div className="lg:hidden sticky top-16 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-sm z-20 py-4 border-b border-gray-200 dark:border-gray-800 -mx-4 px-4 sm:-mx-6 sm:px-6">
                <div className="max-w-lg mx-auto">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-600 dark:text-gray-400">Estimated Total:</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{formatCurrency(totalCost, currency)}</span>
                    </div>
                    <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-md text-sm">
                        <button onClick={() => setMobileView('options')} className={`w-1/2 py-2 rounded transition-colors ${mobileView === 'options' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            Project Features
                        </button>
                        <button onClick={() => setMobileView('summary')} className={`w-1/2 py-2 rounded transition-colors ${mobileView === 'summary' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            Cost Summary
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 lg:mt-0">
                {/* Options Panel */}
                <div className={`
                    ${mobileView === 'options' ? 'block' : 'hidden'} lg:block
                    w-full lg:w-1/2 order-2 lg:order-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative mt-6 lg:mt-0
                `}>
                    <h3 className="text-2xl font-medium text-gray-900 dark:text-white pb-4 border-b border-gray-200 dark:border-gray-800">Project Features</h3>
                    
                    {/* DESKTOP: Single 2-column grid */}
                    <div className="hidden lg:block divide-y divide-gray-200 dark:divide-gray-800">
                        <FeatureControls {...featureControlsProps} />
                    </div>

                    {/* MOBILE: Tabbed, grouped (accordion) layout */}
                    <div className="lg:hidden">
                        <div className="flex border-b border-gray-200 dark:border-gray-800 text-center">
                            <button onClick={() => setMobileFeatureSection('core')} className={`w-1/2 p-3 text-sm font-medium transition-colors ${mobileFeatureSection === 'core' ? 'text-gray-900 dark:text-white border-b-2 border-sky-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                1. Core Setup
                            </button>
                            <button onClick={() => setMobileFeatureSection('advanced')} className={`w-1/2 p-3 text-sm font-medium transition-colors ${mobileFeatureSection === 'advanced' ? 'text-gray-900 dark:text-white border-b-2 border-sky-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                2. Advanced Features
                            </button>
                        </div>

                        <div className="pt-2">
                             {mobileFeatureSection === 'core' && (
                                <div>
                                    <button onClick={() => toggleSection('core')} className="w-full flex justify-between items-center py-3 text-lg font-medium text-gray-900 dark:text-white">
                                        <span>Core Setup & Pages</span>
                                        <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${openSections.includes('core') ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openSections.includes('core') && (
                                        <div className="pl-4 pr-2 pb-2 border-l-2 border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
                                            <CoreFeaturesControls {...featureControlsProps} />
                                        </div>
                                    )}
                                </div>
                            )}
                            {mobileFeatureSection === 'advanced' && (
                                 <div className="border-t border-gray-200 dark:border-gray-800">
                                     <button onClick={() => toggleSection('advanced')} className="w-full flex justify-between items-center py-3 text-lg font-medium text-gray-900 dark:text-white">
                                        <span>Advanced Features & Integrations</span>
                                        <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${openSections.includes('advanced') ? 'rotate-180' : ''}`} />
                                    </button>
                                     {openSections.includes('advanced') && (
                                        <div className="pl-4 pr-2 pb-2 border-l-2 border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
                                            <AdvancedFeaturesControls {...featureControlsProps} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary Panel */}
                <div className={`
                    ${mobileView === 'summary' ? 'block' : 'hidden'} lg:block
                    w-full lg:w-1/2 order-1 lg:order-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 lg:sticky lg:top-24 mt-6 lg:mt-0 lg:flex lg:flex-col
                `}>
                    <h3 className="text-2xl font-medium text-gray-900 dark:text-white pb-4 border-b border-gray-200 dark:border-gray-800">Estimate Summary</h3>
                    
                    {/* Desktop-only total and currency switch */}
                    <div className="hidden lg:block">
                        <div className="my-4">
                            <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-md text-sm">
                                <button onClick={() => setCurrency('ngn')} className={`w-1/2 py-2 rounded ${currency === 'ngn' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>NGN</button>
                                <button onClick={() => setCurrency('usd')} className={`w-1/2 py-2 rounded ${currency === 'usd' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>USD</button>
                            </div>
                        </div>
                        <div className="text-center my-6">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Estimated Cost</p>
                            <p className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">{formatCurrency(totalCost, currency)}</p>
                        </div>
                    </div>

                     {/* Mobile-only currency switch */}
                    <div className="block lg:hidden my-4">
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Display Currency</p>
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md text-sm">
                           <button onClick={() => setCurrency('ngn')} className={`w-1/2 py-2 rounded ${currency === 'ngn' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>NGN (₦)</button>
                           <button onClick={() => setCurrency('usd')} className={`w-1/2 py-2 rounded ${currency === 'usd' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>USD ($)</button>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Payment Milestones</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {milestones.map(m => (
                                <div key={m.phase} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                                    <span>{m.phase}</span>
                                    <span className="font-mono text-gray-700 dark:text-gray-300">{formatCurrency(m.amount, currency)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 lg:mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                        <button 
                            onClick={handleDiscussClick}
                            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
                            <MagicWandIcon className="w-4 h-4" />
                            <span>Discuss with AI</span>
                        </button>
                        <button onClick={handleReset} className="w-full flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors duration-200">
                            <ResetIcon />
                            <span>Reset Selections</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingCalculator;