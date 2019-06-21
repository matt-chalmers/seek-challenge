import * as _ from "lodash";


class Customer {

    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    static load(id) {
        return customerLookup[id];
    }
}

// FIX ME - move data to DB
const customers = [
    new Customer(1, 'SecondBite'),
    new Customer(2, 'Axil Coffee Roasters'),
    new Customer(3, 'MYER'),
    new Customer(4, 'default'),
];

const customerLookup = _.keyBy(customers, o => o.id);