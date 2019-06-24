import * as _ from "lodash";


/**
 * Determine the most cost efficient way to exactly fill a Knapsack with a certain weight
 * using an unlimited supply of items.
 *
 * What sort of problems might need this?
 *
 * Example:
 *    A shopping cart applying bulk discounts. When it gets time to checkout you
 *    need to be able to assign the available discounts against the items in such a way as to
 *    minimise the total purchase cost for the consumer.
 *
 *    For instance the consumer wants to buy X items, with 3 discounts available - a 6-for-4 deal,
 *    a 20-for-12 deal, and a 30-for-15 deal. What is the best way to allocate these deals to the
 *    X items being purchased?
 *
 *    This is akin to filling a knapsack where the target weight for the knapsack = the total number
 *    of items being bought, and the cost and weight of the available items is given by the discount
 *    deals - e.g. a 6-for-4 deal defines a knapsack item type with weight = 6 and cost = (price * 4).
 *
 * For small numbers of deals and item types this is a quick problem to solve. But for large inputs
 * and worst-case data it is a computationally difficult problem, a slight variation on the
 * standard Knapsack problem or M-Partition problem.
 *
 * Here we're going to take an optimistic approach and apply a mix of greedy programming and
 * the branch and bound algorithm, with a depth-first tree walk to fill the knapsack. Our tree
 * walk will process item types *greedily* in order of *ascending cost-per-unit*, which will yield
 * opportunities for branch pruning.
 *
 * The below code uses a simple recurson for readability. The same algorithm could
 * be applied without recursion by using a stack, but I think that would be performance
 * overkill and would be harder to read and understand for most code reviewers.
 *
 * @param {[]} items - the item types with cost and weight
 * @param {Number} targetWeight - weight the Knapsack must hold in the end
 * @return {Array} Return an array of any allocated item types along with their allocation value
 */
export function greedyBandBPlan(items, targetWeight) {
    let result = {
        cost: null,
        allocations: [],
    };

    // Trim down the problem space - avoid searching against pointless items.
    items = items.filter(item => (item.weight <= targetWeight));
    if (items.length === 0) {
        return [];
    }

    // Sort the items by descending profit to ensure we try the highest profit items first
    // hoping to help with later branch pruning. NB: Use Underscore as it has a stable-sort
    // implementation, in case our caller has pre-sorted the items in some preferred way.
    items = _.sortBy(items, item => item.cost / item.weight);

    greedyBAndBPlanTreeWalk(items, targetWeight, 0, [], result);
    return result.allocations;
}

/**
 * Recursive tree walk to find the minimum cost way to meet the target weight.
 *
 * @param {Array} items - the item types, assumed to be ordered by descending profitability
 * @param {Number} targetWeight - remaining target weight to achieve
 * @param {Number} totalCost - the cost of all items already allocated
 * @param {Array}  allocations - an array tracking the allocations made so far
 * @param {object} result - contains the current best cost and allocations list that solves the problem
 */
function greedyBAndBPlanTreeWalk(items, targetWeight, totalCost, allocations, result) {

    // Trim down the problem space - avoid searching against pointless items.
    items = items.filter(item => item.weight <= targetWeight);

    if (items.length === 0) {
        // no more solutions to be found => prune branch
        return;
    }

    if (items.length === 1) {
        // A leaf on the tree
        let item = items[0];
        if (targetWeight % item.weight === 0) {
            let allocation = targetWeight / item.weight;
            totalCost += allocation * item.cost;
            if ( (result.cost === null) || (totalCost < result.cost) ) {
                result.cost = totalCost;
                result.allocations = [...allocations, {item, allocation}];
            }
        }
        return;
    }

    let item = items[0];
    let newAllocations, newTotalCost, newTargetWeight;

    // Greedy match the items, i.e. try biggest allocation you can and then work back to smaller
    // candidate allocations.
    for (let allocation = Math.floor(targetWeight / item.weight); allocation >= 0; allocation--) {

        if ( allocation > 0 ) {
            newAllocations = [...allocations, {item, allocation}];
            newTotalCost = totalCost + (allocation * item.cost);
            newTargetWeight = targetWeight - (allocation * item.weight);
        } else {
            // skip this item
            newAllocations = allocations;
            newTotalCost = totalCost;
            newTargetWeight = targetWeight;
        }

        if (newTargetWeight === 0) {
            // Exact match, another leaf case for the tree.
            // Prune the rest of these sub-branches as they will only rely on higher cost items anyway.
            if ( (result.cost === null) || (newTotalCost < result.cost) ) {
                result.cost = newTotalCost;
                result.allocations = newAllocations;
            }
            return;
        }

        if ( (result.cost !== null) && (newTotalCost > result.cost) ) {
            // We're already at a higher cost than the best current result, can't be optimal
            // => we can prune the rest of the sub-branches here..
            // NB: any remaining sub-branches would only use higher cost items to get back to
            // this point, therefore they can't obtain a total cost less than result.cost
            // either. We need to step up to the previous level and see if it has any branches
            // that work better.
            return;
        }

        greedyBAndBPlanTreeWalk(
            items.slice(1),
            newTargetWeight,
            newTotalCost,
            newAllocations,
            result
        );
    }
}
