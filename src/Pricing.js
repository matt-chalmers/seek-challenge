
import * as _ from "lodash";

import logger from './logging';
import {nForMDealLookup, priceDealLookup} from "./_fakeDB";
import {knapsackCostSolve} from "./Algorithms/KnapSackCostSolver";
import {Product} from "./Product";


/**
 * Abstract class describing the interface common to all Deal types
 */
class AbstractDeal {
    /**
     * Apply this deal to a set of BillItems, updating the items with any
     * resulting discount.
     *
     * @param {BillItem[]} billItems
     */
    apply(billItems) {};

    /**
     * Load all deals of this type for the customer out of state/storage
     *
     * @param {Number} customerId
     * @return {AbstractDeal[]} deals
     */
    static load(customerId) { return []; }
}


/**
 * A PriceDeal lowers the price of a given product to a new fixed price
 */
export class PriceDeal extends AbstractDeal {

    /**
     * Create a PriceDeal
     *
     * @param {Number} customerId
     * @param {string} productCode
     * @param {Number} price
     * @param {Number|undefined|null} triggerSize - the number of items that must be purchased to trigger this deal
     */
    constructor(customerId, productCode, price, triggerSize) {
        super();
        this.customerId = customerId;
        this.productCode = productCode;
        this.price = price;
        this.triggerSize = triggerSize || 0;
    }

    apply(billItems) {
        for ( const item of billItems ) {
            item.setDiscount("PriceDeal", 'price discount deal', Math.max(item.price - this.price, 0));
        }
    };

    static load(customerId) {
        let deals = priceDealLookup[customerId] || [];
        return deals.map(dealData => new this(...dealData));
    }
}

/**
 * A NForMDeal allows the consumer to buy N items of a product for the price of only M items.
 */
export class NForMDeal extends AbstractDeal {
    /**
     * Create a PriceDeal
     *
     * @param {Number} customerId
     * @param {string} productCode
     * @param {Number} purchaseSize - N
     * @param {Number} costSize - M
     */
    constructor(customerId, productCode, purchaseSize, costSize) {
        super();
        this.customerId = customerId;
        this.productCode = productCode;
        this.purchaseSize = purchaseSize;
        this.costSize = costSize;
        this.description = `${this.purchaseSize} for ${this.costSize} deal`;
    }

    apply(billItems) {
        while (billItems.length >= this.purchaseSize) {
            let batch = billItems.splice(0, this.purchaseSize);
            // Leave the price of the first M items alone, then discount the
            // remaining (N-M) to zero cost.
            batch.forEach(
                (item, idx) => {
                    if ( idx >= this.costSize ) {
                        item.setDiscount("NForMDeal", this.description, item.total());
                    }
                }
            );
        }
    };

    static load(customerId) {
        let deals = nForMDealLookup[customerId] || [];
        return deals.map(dealData => new this(...dealData));
    }

    /**
     * Calculate the resulting price of a product when this deal is applied
     *
     * @param {Number} price - the standard price for the product
     * @return {Number} effective price
     */
    effectivePrice(price) {
        return (this.costSize / this.purchaseSize) * price;
    }

    /**
     * Determine the most cost efficient way to apply a set of NForMDeals.
     *
     * For small numbers of deals and items this is a quick problem to solve. But for large inputs
     * and worst-case data it is a computationally hard problem, a slight variation on the
     * Knapsack problem or M-Partition problem.
     *
     * @param {NForMDeal[]} deals
     * @param {Number} numItems - the number of items to allocate
     * @param {Number} stdPrice - the ordinary price to charge for this product inside an NForMDeal
     * @param {Number} discountPrice - the price we can charge for items not allocated to an NForMDeal
     */
    static findBestAllocationPlan(deals, numItems, stdPrice, discountPrice) {

        // Trim down the problem space - avoid searching against pointless deals.
        deals = deals.filter(deal => (deal.effectivePrice(stdPrice) < discountPrice));
        if (deals.length === 0) {
            return [];
        }

        let knapsackItems = deals.map(deal => ({
            weight: deal.purchaseSize,
            cost: deal.effectivePrice(stdPrice) * deal.costSize,
            deal: deal,
        }));
        // Presort by weight, as it looks better in the output to choose bigger deals when a big deal
        // happens to have the same effective price as a smaller deal.
        knapsackItems = _.sortBy(knapsackItems, 'weight').reverse();
        // Add a single item purchase option for the algorithm to complete the matches
        knapsackItems.push({weight: 1, cost: discountPrice, deal: null});

        let plan = knapsackCostSolve(knapsackItems, numItems);

        let allocations = plan.map(x => ({
            deal: x.item.deal,
            allocation: x.allocation,
        }));

        return allocations;
    }
}


export class PricingRules {
    constructor(priceDeals, nForMDeals) {
        this.priceDeals = priceDeals;
        this.nForMDeals = nForMDeals;
    }

    /**
     * Apply this pricing model to a Bill
     *
     * @param {Bill} bill
     */
    apply(bill) {
        for (const item of bill.items) {
            item.price = Product.load(item.productCode).price;
            item.discount = null;
        }

        let productGroups = _.groupBy(bill.items, 'productCode');

        for (const [productCode, productItems] of Object.entries(productGroups)) {
            this._applyProductDeals(productCode, productItems);
        }
    }

    /**
     * Apply any discounts applicable to a specific product
     *
     * @param {string} productCode
     * @param {BillItem[]} productItems
     * @private
     */
    _applyProductDeals(productCode, productItems) {

        // determine pricing to apply

        const stdPrice = Product.load(productCode).price;

        let {priceDeal, nForMDeals} = this._resolveProductDeals(productCode, stdPrice, productItems.length);
        if ((!priceDeal) && (nForMDeals.length === 0)) {
            return; // No deals to apply
        }

        let price = priceDeal ? priceDeal.price : stdPrice;


        // Now apply all the deals

        const remainingProductItems = [...productItems];

        let nForMAllocationPlan = NForMDeal.findBestAllocationPlan(nForMDeals, productItems.length, stdPrice, price);
        logger.debug('_applyProductDeals - nForMAllocationPlan for %d %s = %j, rules = %j', productItems.length, productCode, nForMAllocationPlan, {priceDeal, nForMDeals});
        for (const {deal, allocation} of nForMAllocationPlan) {
            if (deal) {
                let dealItems = remainingProductItems.splice(0, allocation * deal.purchaseSize);
                deal.apply(dealItems);
            }
        }

        if (priceDeal) {
            priceDeal.apply(remainingProductItems);
        }
    }

    /**
     * Determine the best discounts applicable to a specific product.
     *
     * @param {string} productCode
     * @param {Number} productPrice
     * @param {Number} numItems
     * @return {object} A deal lookup by type
     * @private
     */
    _resolveProductDeals(productCode, productPrice, numItems) {
        let priceDeal = null;
        let pricingDeals = this.priceDeals.filter(
            deal =>
                (deal.productCode === productCode) &&
                (deal.price < productPrice) &&
                (deal.triggerSize <= numItems)
        );
        if (pricingDeals.length) {
            priceDeal = _.minBy(pricingDeals, 'price');
        }

        let nForMDeals = this.nForMDeals.filter(
            deal => (deal.productCode === productCode) && (deal.effectivePrice(productPrice) < productPrice)
        );

        return {priceDeal, nForMDeals};
    }

    /**
     * Load a pricing rules for a given customer from state/storage
     *
     * @param {Number} customerId
     */
    static load(customerId) {
        return new this(PriceDeal.load(customerId), NForMDeal.load(customerId));
    }
}

