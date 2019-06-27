
import {BillItem, Bill} from "../src/Bill";
import {Discount} from "../src/Pricing";


describe("Bill Tests", function() {

    describe("BillItem Tests", function() {
        test("Non-discounted total", function () {
            let item = new BillItem('standard');
            item.price = 123.123;
            expect(item.total()).toEqual(123.123);
        });

        test("Discounted Total", function () {
            let item = new BillItem('standard');
            item.price = 123.123;
            item.setDiscount('TEST', 'TEST', 100.123);
            expect(item.total()).toEqual(23);
        });

        test("Missing Pricing", function () {
            let item = new BillItem('standard');
            expect(() => item.total()).toThrow();
        });

    });

    describe("Bill Tests", function() {
        test("Non-discounted total", function () {
            let bill = new Bill(['standard', 'standard']);
            bill.items[0].price = 123.123;
            bill.items[1].price = 123.123;
            expect(bill.total()).toEqual(246.246);
        });

        test("Discounted Total", function () {
            let bill = new Bill(['standard', 'standard']);
            bill.items[0].price = 123.123;
            bill.items[0].setDiscount('TEST', 'TEST', 100.123);
            bill.items[1].price = 123.123;
            expect(bill.total()).toEqual(146.123);
        });

        test("Missing Pricing", function () {
            let bill = new Bill(['standard', 'standard']);
            expect(() => item.total()).toThrow();
        });
    });

});
