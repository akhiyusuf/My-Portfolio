export const PRICING = {
    baseFee: 250000, // Merged baseSetup (150k) and responsiveDev (100k)
    designBaseCost: 100000, // This is the cost for Tier 1. Higher tiers are multiples of this.
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

export const initialSelections = {
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

export type Selections = typeof initialSelections;

export const calculateTotalCost = (selections: Selections): number => {
    const costComponents = [
        // Base Costs
        PRICING.baseFee,
        PRICING.designBaseCost * selections.designTier,

        // Page Costs
        PRICING.standardPage * selections.standardPages,
        PRICING.complexPage * selections.complexPages,
        PRICING.systemPage * selections.systemPages,

        // Feature Costs
        PRICING.cms[selections.cmsType as keyof typeof PRICING.cms],
        selections.products > 0 ? PRICING.ecommerceBase : 0,
        PRICING.product * selections.products,
        selections.userAuth ? PRICING.userAuth : 0,
        selections.paymentGateway ? PRICING.paymentGateway : 0,
        PRICING.apiIntegration * selections.apis
    ];
    
    // Sum all components to get the total cost
    return costComponents.reduce((total, current) => total + current, 0);
};
