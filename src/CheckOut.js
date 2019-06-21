
import * as _ from "lodash";
import {Product} from "./Product";



class BillItem {
    constructor(productCode, price) {
        this.productCode = productCode;
        this.price = price;
        this.discounts = [];
        this.discountState = {};
    }

    total() {
        return this.price - _.sumBy(this.discounts, 'amount');
    }
}


class Bill {
    constructor() {
        this.items = [];
    }

    add(productCode, price) {
        this.items.push(
            new BillItem(productCode, price)
        );
    }

    total() {
        return _.sumBy(this.items, item => item.total());
    }
}



export class CheckOut {

    constructor(pricingRules) {
        this.pricingRules = pricingRules;
        this.items = [];
    }

    /**
     * Add an item to the current checkout
     * @param {string} itemCode
     */
    add(productCode) {
        this.items.push(productCode);
    }

    /**
     * Calculate the total cost of the current items, applying relevant customer discounts
     * @return {Number} Total cost
     */
    total() {
        const bill = new Bill();
        for ( const productCode of this.items ) {
            const price = Product.load(productCode).price;
            bill.add(productCode, price);
        }

        for ( const priceDeal of this.pricingRules.priceDeals ) {
            priceDeal.apply(bill);
        }

        for ( const nForMDeal of this.pricingRules.nForMDeals ) {
            nForMDeal.apply(bill);
        }

        return bill.total();
    }
}
