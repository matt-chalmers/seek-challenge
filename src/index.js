import {getPricingRules} from "./Deals";
import {CheckOut} from "./CheckOut";


console.info('Not yet implemented');


// trigger a price deal only
let customerId = 5;
let pricingRules = getPricingRules(customerId);
let checkOut = new CheckOut(pricingRules);

for (let i = 0; i < 26; i++) {
    checkOut.add('classic');
}

console.log(checkOut.total());
