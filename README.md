# Seek Coding Challenge

## This is an WIP version, lots more tests required still!

## Coding Exercise
For the purpose of this exercise, SEEK is in the process of rewriting its job ads checkout system. We want to offer different products to recruiters:


| Name | Description | Retail Price |
|:---- |:----------- | ------------:|
| Classic Ad | Offers the most basic level of advertisement | $269.99 |
| Stand out Ad | Allows advertisers to use a company logo and use a longer presentation text | $322.99 |
| Premium Ad | Same benefits as Standout Ad, but also puts the advertisement at the top of the results, allowing higher visibility | $394.99 |

We have established a number of special pricing rules for a small number of privileged customers:

1. SecondBite
   * Gets a 3​ for 2​ deal on ​Classic Ads  
   
2. Axil Coffee Roasters
   * Gets a discount on ​Standout Ads ​where the price drops to $​299.99 p​er ad
   
3. MYER
   * Gets a 5​ for 4​ deal on ​Stand out Ads
   * Gets a discount on​ Premium Ads ​where the price drops to $​389.99 ​per ad

These details are regularly renegotiated, so we need the pricing rules to be as flexible as possible as they can c​hange​ in the future with little notice.

The interface to our checkout looks like this pseudocode:

    Checkout co = Checkout.new(pricingRules)
    co.add(item1)
    co.add(item2)
    co.total()

## Example scenarios

    Customer: default
    Items: `classic`, `standout`, `premium`
    Total: $987.97

    Customer: SecondBite
    Items: `classic`, `classic`, `classic`, `premium`
    Total: $934.97

    Customer: Axil Coffee Roasters
    Items: `standout`, `standout`, `standout`, `premium`
    Total: $1294.96
