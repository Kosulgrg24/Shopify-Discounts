// import {
//   ProductDiscountSelectionStrategy,
//   CartLinesDiscountsGenerateRunResult,
//   Input as CartInput,
//   ProductDiscountCandidate,
// } from "../generated/api";

// interface Tier {
//   threshold: number;
//   discount: number;
// }

// const TIERS: Tier[] = [
//   { threshold: 100, discount: 10 },
//   { threshold: 200, discount: 20 },
//   { threshold: 300, discount: 30 },
// ];

// function getTier(cost: number): Tier | undefined {
//   return [...TIERS]
//     .sort((a, b) => b.threshold - a.threshold)
//     .find((tier) => cost >= tier.threshold);
// }

// export function cartLinesDiscountsGenerateRun(
//   input: CartInput
// ): CartLinesDiscountsGenerateRunResult {
//   if (!input.cart.lines.length) {
//     return { operations: [] };
//   }
//   const productCandidates: ProductDiscountCandidate[] = [];

//   for (const cartLine of input.cart.lines) {
//     const tier = getTier(parseFloat(cartLine.cost.subtotalAmount.amount));
//     if (tier) {
//       productCandidates.push({
//         message: `${tier.discount}$ off`,
//         targets: [
//           {
//             cartLine: {
//               id: cartLine.id,
//             },
//           },
//         ],
//         value: {
//           fixedAmount: {
//             amount: tier.discount.toFixed(2),
//           },
//         },
//       });
//     }
//   }
//   const result: CartLinesDiscountsGenerateRunResult = { operations: [] };
//   if (productCandidates.length > 0) {
//     result.operations.push({
//       productDiscountsAdd: {
//         candidates: productCandidates,
//         selectionStrategy: ProductDiscountSelectionStrategy.All,
//       },
//     });
//   }

//   return result;
// }

import {
  DiscountClass,
  InputCartRun,
  CartLinesDiscountsGenerateRunResult,
} from "../generated/api";

export function cartLinesDiscountsGenerateRun(
  input: InputCartRun
): CartLinesDiscountsGenerateRunResult {
  const {
    fetchResult,
    discount: { discountClasses },
  } = input;

  const body = fetchResult?.jsonBody;

  console.log("fetchResult:", fetchResult);

  if (!body) {
    throw new Error("Missing response body");
  }

  const operations = body;

  const hasOrderDiscountClass = discountClasses.includes(DiscountClass.Order);
  const hasProductDiscountClass = discountClasses.includes(
    DiscountClass.Product
  );

  if (!hasOrderDiscountClass && !hasProductDiscountClass) {
    return { operations: [] };
  }

  const filteredOperations = operations.filter((operation) => {
    if (operation.enteredDiscountCodesAccept) {
      return true;
    }

    if (operation.orderDiscountsAdd) {
      return hasOrderDiscountClass;
    }

    if (operation.productDiscountsAdd) {
      return hasProductDiscountClass;
    }

    return false;
  });

  return { operations: filteredOperations };
}
