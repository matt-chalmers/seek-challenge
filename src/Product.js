import * as _ from "lodash";


export class Product {
    constructor(code, name, description, price) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.price = price;
    }

    static load(code) {
        return productLookup[code];

    }
}


// FIX ME - move this data to the DB

const products = [
    new Product(
        'classic',
        'Classic Ad',
        'Offers the most basic level of advertisement',
        269.99
    ),
    new Product(
        'standout',
        'Stand out Ad',
        'Allows advertisers to use a company logo and use a longer presentation text',
        322.99
    ),
    new Product(
        'premium',
        'Premium Ad',
        'Same benefits as Standout Ad, but also puts the advertisement at the top of the results, allowing higher visibility',
        394.99
    ),
];

const productLookup = _.keyBy(products, 'code');
