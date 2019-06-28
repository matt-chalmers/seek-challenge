

/*
 Please NB: This is an INTEGRATED test module -- I am out of time to correctly unit test
 all the code layers, but I will use this module to provide us some higher level coverage as well.
 */

import {PricingRules} from "../src/Pricing";
import {CheckOut} from "../src/CheckOut";

describe("Integrated Checkout Tests", function() {

    describe("Example Tests", function() {
        // These are the example tests provided in the challenge specification

        test("Example Test 1", function () {
            const customerId = 4;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            checkOut.add('classic');
            checkOut.add('standout');
            checkOut.add('premium');

            expect(checkOut.total()).toBeCloseTo(987.97, 5);
        });

        test("Example Test 2", function () {
            const customerId = 1;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            checkOut.add('classic');
            checkOut.add('classic');
            checkOut.add('classic');
            checkOut.add('premium');

            expect(checkOut.total()).toBeCloseTo(934.97, 5);
        });

        test("Example Test 3", function () {
            const customerId = 2;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            checkOut.add('standout');
            checkOut.add('standout');
            checkOut.add('standout');
            checkOut.add('premium');

            expect(checkOut.total()).toBeCloseTo(1294.96, 5);
        });
    });

    describe("Deals", function() {

        test("Single NForM Deal", function () {
            // buy enough items to trigger a single deal
            const customerId = 5;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            for (let i = 0; i < 6; i++) {
                checkOut.add('classic');
            }

            expect(checkOut.total()).toBeCloseTo(1079.96, 5);
        });

        test("Single NForM Deal + extra item", function () {
            // buy enough items to trigger a single deal + one extra item at full price
            const customerId = 5;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            for (let i = 0; i < 7; i++) {
                checkOut.add('classic');
            }

            expect(checkOut.total()).toBeCloseTo(1349.95, 5);
        });

        test("Single NForM Deal Repeated", function () {
            // buy enough items to trigger a deal twice
            const customerId = 5;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            for (let i = 0; i < 12; i++) {
                checkOut.add('classic');
            }

            expect(checkOut.total()).toBeCloseTo(2159.92, 5);
        });

        test("Single NForM Deal Repeated + extra item", function () {
            // buy enough items to trigger a deal twice + one extra item at full price
            const customerId = 5;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            for (let i = 0; i < 13; i++) {
                checkOut.add('classic');
            }

            expect(checkOut.total()).toBeCloseTo(2429.91, 5);
        });

        test("Two NForM Deals", function () {
            // buy enough items to trigger two different deals at the same time
            const customerId = 5;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            for (let i = 0; i < 26; i++) {
                checkOut.add('premium');
            }

            expect(checkOut.total()).toBeCloseTo(6319.84, 5);
        });

        test("Two NForM Deals  + extra item", function () {
            // buy enough items to trigger two different deals at the same time + one extra item at full price
            const customerId = 5;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            for (let i = 0; i < 27; i++) {
                checkOut.add('premium');
            }

            expect(checkOut.total()).toBeCloseTo(6714.83, 5);
        });

        test("Price Deal - No trigger", function () {
            // trigger a price deal only
            const customerId = 5;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            for (let i = 0; i < 2; i++) {
                checkOut.add('standout');
            }

            expect(checkOut.total()).toBeCloseTo(599.98, 5);
        });

        test("Price Deal - Trigger", function () {
            // trigger a price deal only
            const customerId = 7;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            for (let i = 0; i < 3; i++) {
                checkOut.add('test1');
            }

            expect(checkOut.total()).toBeCloseTo(450, 5);
        });

        test("Price Deal - Not triggered - Fallback Deal", function () {
            // Don't trigger a price deal below threshhold
            const customerId = 7;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            for (let i = 0; i < 2; i++) {
                checkOut.add('test1');
            }

            expect(checkOut.total()).toBeCloseTo(400, 5);
        });

        test("Price Deal - Not triggered - No Fallback", function () {
            // Don't trigger a price deal below threshhold
            const customerId = 7;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            checkOut.add('test1');

            expect(checkOut.total()).toBeCloseTo(394.99, 5);
        });

        test("Price Trumps NForM", function () {
            // test Price deals can beat NForM deals
            const customerId = 5;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            for (let i = 0; i < 2; i++) {
                checkOut.add('test1');
            }

            expect(checkOut.total()).toBeCloseTo(300, 5);
        });

        test("NForM Trumps Price", function () {
            //test NForM deals can beat price deals
            const customerId = 5;
            const pricingRules = PricingRules.load(customerId);
            const checkOut = new CheckOut(pricingRules);

            for (let i = 0; i < 2; i++) {
                checkOut.add('test2');
            }

            expect(checkOut.total()).toBeCloseTo(394.99, 5);
        });

    });

});
