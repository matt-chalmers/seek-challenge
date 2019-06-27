
import {Product} from "../src/Product";


describe("Product Tests", function() {

    test("Load Product", function () {
        let product = Product.load('test1');
        expect([
            product.code,
            product.name,
            product.description,
            product.price,
        ]).toEqual([
            'test1',
            'Test1',
            'Blah Blah Blah',
            394.99,
        ]);
    });

    test("Missing Product", function () {
        expect(() => Product.load("-1")).toThrow();
    });

});
