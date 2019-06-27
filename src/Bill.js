
import * as _ from "lodash";


// TODO - make concrete discount classes to lock down the "type" ??
/**
 * Describes a discount applied to a product
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


/**
 * A BillItem represents a single product line item during bill analysis.
 */
export class BillItem {
    /**
     * Create a BillItem
     *
     * @param {string} productCode
     */
    constructor(productCode) {
        this.productCode = productCode;
        this.price = null;
        this.discount = null
    }

    setDiscount(type, description, amount) {
        this.discount = new Discount(type, description, amount);
    }

    /**
     * Calculate the cost of this item, including any applied discounts
     *
     * @return {Number} cost
     */
    total() {
        if ( this.price === null ) {
            throw new Error('Pricing missing from bill item');
        }
        return this.price - (this.discount ? this.discount.amount : 0);
    }
}


/**
 * A Bill represents the line-by-line cost of a series of products
 */
export class Bill {
    /**
     * Create a Bill
     *
     * @param {BillItem} items
     */
    constructor(items) {
        this.items = items.map(x => new BillItem(x));
    }

    /**
     * Calculate the total cost for all line items in this bill, including applied discounts
     *
     * @return {Number} cost
     */
    total() {
        return _.sumBy(this.items, item => item.total());
    }

}
