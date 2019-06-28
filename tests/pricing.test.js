
import * as _ from 'lodash';

import {NForMDeal, PriceDeal} from "../src/Pricing";
import {Bill, BillItem} from "../src/Bill";


describe("Pricing Tests", function() {

    describe("Price Deal Tests", function() {

/*
        PriceDeal extends AbstractDeal {


            constructor(customerId, productCode, price) {
                super();
                this.customerId = customerId;
                this.productCode = productCode;
                this.price = price;
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
        */

        test("Load Deal", function () {
            const deals = PriceDeal.load(6);
            expect(deals).toEqual([
                {
                    customerId: 6,
                    productCode: 'test1',
                    price: 150,
                    triggerSize: 0,
                },
                {
                    customerId: 6,
                    productCode: 'test1',
                    price: 200,
                    triggerSize: 0,
                },
            ]);
        });

        test("Missing Deal", function () {
            const deals = PriceDeal.load(-1);
            expect(deals).toEqual([]);
        });

        /*
        test("Apply", function () {
            const billItems = [
                new BillItem('test1'),
                new BillItem('test1'),
            ];
            billItems[0].price = 123.123;
            billItems[1].price = 123.123;

            const deal = new PriceDeal(6, 'test1', 100);
            deal.apply(billItems);

            expect(billItems[0].discount.ammount).toBe(23.123);
            expect(billItems[1].discount.ammount).toBe(23.123);
        });
        */
    });

    describe("NForM Deal Tests", function() {

        test("Load Deal", function () {
            let deals = NForMDeal.load(6);

            expect(deals).toEqual([
                {
                    customerId: 6,
                    productCode: 'test1',
                    purchaseSize: 2,
                    costSize: 1,
                    description: `2 for 1 deal`,
                },
                {
                    customerId: 6,
                    productCode: 'test2',
                    purchaseSize: 5,
                    costSize: 2,
                    description: `5 for 2 deal`,
                },
            ]);
        });

        test("Missing Deal", function () {
            let deals = NForMDeal.load(-1);
            expect(deals).toEqual([]);
        });
    });

});
