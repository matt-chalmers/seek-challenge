
import * as _ from "lodash";


class AbstractDeal {
    apply(bill) {};
}

export class PriceDeal extends AbstractDeal {
    constructor(customerId, productCode, price) {
        super();
        this.customerId = customerId;
        this.productCode = productCode;
        this.price = price;
    }

    apply(bill) {
        const matchingProducts = bill.items.filter(x => x.productCode === this.productCode);

        for (const item of matchingProducts) {
            if ( this.price < item.price ) {
                item.discounts.push({
                    type: "PriceDeal",
                    description: 'price discount deal',
                    amount: item.price - this.price,
                });
                item.discountState.PriceDeal = true;
            }
        }
    };

    static load(customerId) {
        return priceDealLookup[customerId] || [];
    }
}

export class NForMDeal extends AbstractDeal {
    constructor(customerId, productCode, batchSize, costSize) {
        super();
        this.customerId = customerId;
        this.productCode = productCode;
        this.batchSize = batchSize;
        this.costSize = costSize;
    }

    discountBatch(batch) {
        batch.forEach(
            (item, idx) => {
                if ( idx >= this.costSize ) {
                    item.discounts.push({
                        type: "NForMDeal",
                        description: `${this.batchSize} for ${this.costSize} deal`,
                        amount: item.total(),
                    });
                }
                item.discountState.NForMDeal = true;
            }
        );
    }

    apply(bill) {
        const matchingProductItems = bill.items.filter(x => x.productCode === this.productCode);
        const unappliedItems = matchingProductItems.filter(item => !item.discountState.NForMDeal);

        while (unappliedItems.length >= this.batchSize) {
            this.discountBatch(
                unappliedItems.splice(0, this.batchSize)
            );
        }
    };

    static load(customerId) {
        return nForMDealLookup[customerId] || [];
    }
}


// FIX ME - move this data to the DB
const priceDeals = [
    new PriceDeal(2, 'standout', 299.99),
    new PriceDeal(3, 'premium', 389.99)
];

const nForMDeals = [
    new NForMDeal(1, 'classic', 3, 2),
    new NForMDeal(3, 'standout', 5, 4),
];


// FIX ME - use DB lookups, then we won't need these in memory functions

const priceDealLookup = {};

for (const deal of priceDeals) {
    if (!(deal.customerId in priceDealLookup)) {
        priceDealLookup[deal.customerId] = [];
    }
    priceDealLookup[deal.customerId].push(deal);
}

const nForMDealLookup = {};

for (const deal of nForMDeals) {
    if (!(deal.customerId in nForMDealLookup)) {
        nForMDealLookup[deal.customerId] = [];
    }
    nForMDealLookup[deal.customerId].push(deal);
}


export function getPricingRules(customerId) {
    return {
        priceDeals: PriceDeal.load(customerId),
        nForMDeals: NForMDeal.load(customerId),
    }
}

