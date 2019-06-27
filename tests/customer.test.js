
import {Customer} from "../src/Customer";


describe("Customer Tests", function() {

    test("Load Customer", function () {
        const customer = Customer.load(5);
        expect([
            customer.id,
            customer.name
        ]).toEqual([
            5,
            'TEST'
        ]);
    });

    test("Missing Customer", function () {
        expect(() => Customer.load(-1)).toThrow();
    });

});
