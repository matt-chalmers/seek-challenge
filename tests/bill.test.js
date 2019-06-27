

import {BillItem} from "../src/Bill";
import {Discount} from "../src/Pricing";

describe("Bill Tests", function() {

    describe("BillItem Tests", function() {
        test("Non-discounted total", function () {
            let item = new BillItem('standard', 123.123);
            expect(item.total()).toEqual(123.123);
        });

        test("Discounted Total", function () {
            let item = new BillItem('standard', 123.123);
            item.discount = new Discount('TEST', 'TEST', 100.123);
            expect(item.total()).toEqual(23);
        });
    });



});
