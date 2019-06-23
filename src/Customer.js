
import {customerLookup} from "./_fakeDB";


export class Customer {

    /**
     * Create a Customer
     *
     * @param {Number} id
     * @param {string} name
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    /**
     * Load a customer record from state/storage
     *
     * @param {Number} id
     */
    static load(id) {
        return new Customer(...customerLookup[id]);
    }
}

