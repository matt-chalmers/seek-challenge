

/*
 Please NB: This is an INTEGRATED test module -- I am out of time to correctly unit test
 all the code layers, but I will use this module to provide us some higher level coverage as well.
 */

import {getPricingRules} from "../src/Deals";
import {CheckOut} from "../src/CheckOut";

describe("Integrated Checkout Tests", function() {


    describe("Example Tests", function() {
        // These are the example tests provided in the challenge specification

        it("Example Test 1", function () {
            let customerId = 4;
            let pricingRules = getPricingRules(customerId);
            let checkOut = new CheckOut(pricingRules);

            checkOut.add('classic');
            checkOut.add('standout');
            checkOut.add('premium');

            expect(checkOut.total()).toEqual(987.97);
        });

        it("Example Test 2", function () {
            let customerId = 1;
            let pricingRules = getPricingRules(customerId);
            let checkOut = new CheckOut(pricingRules);

            checkOut.add('classic');
            checkOut.add('classic');
            checkOut.add('classic');
            checkOut.add('premium');

            expect(checkOut.total()).toEqual(934.97);
        });

        it("Example Test 3", function () {
            let customerId = 2;
            let pricingRules = getPricingRules(customerId);
            let checkOut = new CheckOut(pricingRules);

            checkOut.add('standout');
            checkOut.add('standout');
            checkOut.add('standout');
            checkOut.add('premium');

            expect(checkOut.total()).toEqual(1294.96);
        });
    });

});
