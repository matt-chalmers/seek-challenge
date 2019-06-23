
import * as _ from "lodash";

import logger from './logging';
import {nForMDealLookup, priceDealLookup} from "./_fakeDB";
import {greedyBandBPlan} from "./Algorithms/GreedyBandB";


/**
 * Describes a discount applied to a BillItem
 */
export class Discount {
    /**
     * Create a Discount
     *
     * @param {string} type
     * @param {string} description
     * @param {Number} amount
     */
    constructor(type, description, amount) {
        this.type = type;
        this.description = description;
        this.amount = amount;
    }
}

// TODO - make concrete discount classes to lock down the "type"


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
     */
    constructor(customerId, productCode, price) {
        super();
        this.customerId = customerId;
        this.productCode = productCode;
        this.price = price;
    }

    apply(billItems) {
        for ( const item of billItems ) {
            item.discount = new Discount("PriceDeal", 'price discount deal', Math.max(item.price - this.price, 0));
        }
    };

    static load(customerId) {
        let deals = priceDealLookup[customerId] || [];
        return deals.map(dealData => new PriceDeal(...dealData));
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
                        item.discount = new Discount("NForMDeal", this.description, item.total());
                    }
                }
            );
        }
    };

    static load(customerId) {
        let deals = nForMDealLookup[customerId] || [];
        return deals.map(dealData => new NForMDeal(...dealData));
    }

    get discountPercent() { return 100 * (1 - (this.costSize / this.purchaseSize)); }

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
     * Best approach?
     *      - The standard dynamic programming method provides decent worst-case complexity O(NW)
     *        and would be a reasonable choice
     *
     *      - Greedy algorithms are likely to yield a significant speed-up given purchasing behaviour
     *        will likely match up against the discount multiples
     *
     *      - Branch and bound algorithms have a relatively poor worst-case complexity O(2^N), but it
     *        is much more likely to run quite quickly due to branch pruning
     *
     * For this example I'm going to take the optimistic route and apply a mix of Greedy programming and
     * the branch and bound approach.
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

        let bAndBAlgItems = deals.map(deal => ({
            weight: deal.purchaseSize,
            cost: deal.effectivePrice(stdPrice) * deal.costSize,
            deal: deal,
        }));
        // Presort by weight, as it looks better in the output to choose bigger deals when a big deal
        // happens to have the same effective price as a smaller deal.
        bAndBAlgItems = _.sortBy(bAndBAlgItems, 'weight').reverse();
        // Add a single item purchase option for the algorithm to complete the matches
        bAndBAlgItems.push({weight: 1, cost: discountPrice, deal: null});

        let plan = greedyBandBPlan(bAndBAlgItems, numItems);

        let allocations = plan.map(x => ({
            deal: x.item.deal,
            allocation: x.allocation,
        }));

        return allocations;
    }

    /**
     * Recursive tree walk to find the most cost efficient way to apply a set of NForMDeals.
     *
     * @param {NForMDeal[]} deals - assumed top be ordered by ascending cost-per-unit
     * @param {Number} level - current level of the deal tree we are exploring
     * @param {Number} remaining - number of items not yet allocated to a deal
     * @param {Number} totalCost - the cost of all items already allocated to deals
     * @param {Array}  allocations - an array tracking the deals and allocations made so far
     * @param {Number} stdPrice - the ordinary price to charge for this product inside an NForMDeal
     * @param {Number} discountPrice - the price we can charge for items not allocated to an NForMDeal
     * @param {object} result - contains the current best cost and allocations list that solves the problem
     * @return {boolean} If the algorithm is finished
     */
    static _findBestAllocationTreeWalk(deals, level, remaining, totalCost, allocations, stdPrice, discountPrice, result) {

        if (level >= deals.length) {
            totalCost += remaining * discountPrice;
            if ( (result.cost === null) || (totalCost < result.cost)) {
                result.cost = totalCost;
                result.allocations = allocations;
            }
            return level === 0;
        }


        let deal = deals[level];
        let allocation, newAllocations, newTotalCost, newRemaining;

        // Greedy match the deals, i.e. try biggest allocation you can and then work back to smaller
        // candidate allocations.
        for (let i = Math.floor(remaining / deal.purchaseSize); i >= 0; i--) {

            if ( i > 0 ) {
                allocation = i * deal.purchaseSize;
                newAllocations = [...allocations, {deal, allocation}];
                newTotalCost = totalCost + (i * deal.costSize * stdPrice);
                newRemaining = remaining - allocation;
            } else {
                // skip this deal
                allocation = 0;
                newAllocations = allocations;
                newTotalCost = totalCost;
                newRemaining = remaining;
            }

            if (newRemaining === 0) {
                // Exact match, must be the optimal case => we can return early
                result.cost = newTotalCost;
                result.allocations = newAllocations;
                return true;
            }

            if ( (result.cost !== null) && (newTotalCost > result.cost) ) {
                // We're already at a higher cost, can't be optimal => we can prune he branch.
                continue;
            }

            const finished = this._findBestAllocationTreeWalk(
                deals,
                level + 1,
                newRemaining,
                newTotalCost,
                newAllocations,
                stdPrice,
                discountPrice,
                result
            );

            if ( finished ) {
                return true;
            }
        }

        return level === 0;
    }
}


/**
 * Load a pricing rules for a given customer from state/storage
 *
 * @param {Number} customerId
 */
export function getPricingRules(customerId) {
    return {
        priceDeals: PriceDeal.load(customerId),
        nForMDeals: NForMDeal.load(customerId),
    }
}

