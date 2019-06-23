
import * as _ from "lodash";

import logger from './logging';
import {Product} from "./Product";
import {NForMDeal} from "./Deals";


/**
 * A BillItem represents a single product line item during bill analysis.
 */
export class BillItem {
    /**
     * Create a BillItem
     *
     * @param {string} productCode
     * @param {Number} price
     */
    constructor(productCode, price) {
        this.productCode = productCode;
        this.price = price;
        this.discount = null
    }

    /**
     * Calculate the cost of this item, including any applied discounts
     *
     * @return {Number} cost
     */
    total() {
        return this.price - (this.discount ? this.discount.amount : 0);
    }
}


/**
 * A Bill represents the line-by-line cost of a series of products
 */
export class Bill {
    constructor() {
        this.items = [];
    }

    /**
     * Add a product to this bill
     *
     * @param {string} productCode
     * @param {Number} price
     */
    add(productCode) {
        const price = Product.load(productCode).price;
        this.items.push(new BillItem(productCode, price));
    }

    /**
     * Calculate the total cost for all line items in this bill, including applied discounts
     *
     * @return {Number} cost
     */
    total() {
        return _.sumBy(this.items, item => item.total());
    }

    /**
     * Remove any discounts currently applied to this Bill
     */
    clearDiscounts() {
        for (const item of this.items) {
            item.discount = null;
        }
    }

    /**
     * Apply any discounts applicable to this Bill
     *
     * @param {object} pricingRules
     */
    applyDeals(pricingRules) {
        this.clearDiscounts();

        let productGroups = _.groupBy(this.items, 'productCode');

        for (const [productCode, productItems] of Object.entries(productGroups)) {
            this._applyProductDeals(pricingRules, productCode, productItems);
        }
    }

    /**
     * Determine the best discounts applicable to a specific product.
     *
     * @param {object} pricingRules
     * @param {string} productCode
     * @param {BillItem[]} productItems
     * @return {object} A deal lookup by type
     * @private
     */
    _resolveProductDeals(pricingRules, productCode, productPrice) {
        let priceDeal = null;
        let pricingDeals = pricingRules.priceDeals.filter(
            deal => (deal.productCode === productCode) && (deal.price < productPrice)
        );
        if (pricingDeals.length) {
            priceDeal = _.minBy(pricingDeals, 'price');
        }

        let nForMDeals = pricingRules.nForMDeals.filter(
            deal => (deal.productCode === productCode) && (deal.effectivePrice(productPrice) < productPrice)
        );

        return {priceDeal, nForMDeals};
    }

    /**
     * Apply any discounts applicable to a specific product
     *
     * @param {object} pricingRules
     * @param {string} productCode
     * @param {BillItem[]} productItems
     * @private
     */
    _applyProductDeals(pricingRules, productCode, productItems) {

        // determine pricing to apply

        const stdPrice = Product.load(productCode).price;

        let {priceDeal, nForMDeals} = this._resolveProductDeals(pricingRules, productCode, stdPrice);
        if ((!priceDeal) && (nForMDeals.length === 0)) {
            return; // No deals to apply
        }

        let price = priceDeal ? priceDeal.price : stdPrice;


        // Now apply all the deals

        const remainingProductItems = [...productItems];

        let nForMAllocationPlan = NForMDeal.findBestAllocationPlan(nForMDeals, productItems.length, stdPrice, price);
        logger.debug('_applyProductDeals - nForMAllocationPlan for %d %s = %j, rules = %j', productItems.length, productCode, nForMAllocationPlan, pricingRules);
        for (const {deal, allocation} of nForMAllocationPlan) {
            let dealItems = remainingProductItems.splice(0, allocation);
            deal.apply(dealItems);
        }

        if (priceDeal) {
            priceDeal.apply(remainingProductItems);
        }
    }
}
