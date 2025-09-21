export const PRICING = {
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
};
