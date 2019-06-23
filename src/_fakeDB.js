
import * as _ from "lodash";
import {Customer} from "./Customer";
import {NForMDeal, PriceDeal} from "./Deals";
import {Product} from "./Product";


// FIX ME - move data to DB


/******** customers ********/

const customers = [
    //[customerId, name]
    [1, 'SecondBite'],
    [2, 'Axil Coffee Roasters'],
    [3, 'MYER'],
    [4, 'default'],
    [5, 'TEST'],
];

export const customerLookup = _.keyBy(customers, 0);


/******** products ********/

const products = [
    // [productCode, Product Name, Description, Price
    [
        'classic',
        'Classic Ad',
        'Offers the most basic level of advertisement',
        269.99
    ],
    [
        'standout',
        'Stand out Ad',
        'Allows advertisers to use a company logo and use a longer presentation text',
        322.99
    ],
    [
        'premium',
        'Premium Ad',
        'Same benefits as Standout Ad, but also puts the advertisement at the top of the results, allowing higher visibility',
        394.99
    ],
    [
        'test1',
        'Test1',
        'Blah Blah Blah',
        394.99
    ],
    [
        'test2',
        'Test2',
        'Blah Blah Blah',
        394.99
    ],
];

export const productLookup = _.keyBy(products, 0);


/******** deals ********/

const priceDeals = [
    // [customerId, productCode, price]
    [2, 'standout', 299.99],
    [3, 'premium', 389.99],

    // test deals
    [5, 'standout', 299.99],
    [5, 'test1', 150],
    [5, 'test1', 200],

];

const nForMDeals = [
    // [customerId, productCode, purchaseSize, costSize]

    // example deals
    [1, 'classic', 3, 2],
    [1, 'classic', 30, 13],
    [3, 'standout', 5, 4],

    // test deals
    [5, 'classic', 6, 4],
    [5, 'classic', 20, 12],
    [5, 'classic', 30, 15],

    [5, 'premium', 6, 4],
    [5, 'premium', 20, 12],
    [5, 'premium', 30, 15],

    [5, 'test1', 2, 1], // not as good as the price deal
    [5, 'test2', 2, 1], // better than the price deal
];


export const priceDealLookup = {};

for (const deal of priceDeals) {
    let customerId = deal[0];
    if (!(customerId in priceDealLookup)) {
        priceDealLookup[customerId] = [];
    }
    priceDealLookup[customerId].push(deal);
}

export const nForMDealLookup = {};

for (const deal of nForMDeals) {
    let customerId = deal[0];
    if (!(customerId in nForMDealLookup)) {
        nForMDealLookup[customerId] = [];
    }
    nForMDealLookup[customerId].push(deal);
}
