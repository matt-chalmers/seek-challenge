
import {productLookup} from "./_fakeDB";


export class Product {

    /**
     * Create a Product
     *
     * @param {string} code
     * @param {string} name
     * @param {string} description
     * @param {Number} price
     */
    constructor(code, name, description, price) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.price = price;
    }

    /**
     * Load a product record from state/storage
     *
     * @param {Number} id
     */
    static load(code) {
        const data = productLookup[code];
        if (! data) {
            throw new Error('Missing product');
        }
        return new this(...data);
    }
}


