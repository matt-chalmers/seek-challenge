import {PricingRules} from "./Pricing";
import {CheckOut} from "./CheckOut";


console.info('Not yet implemented');


let customerId = 5;
let pricingRules = PricingRules.load(customerId);
let checkOut = new CheckOut(pricingRules);

for (let i = 0; i < 10000; i++) {
    checkOut.add('classic');
}

console.log(checkOut.total());
