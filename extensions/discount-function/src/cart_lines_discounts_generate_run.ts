import {
  ProductDiscountSelectionStrategy,
  CartLinesDiscountsGenerateRunResult,
  Input as InputCartRun,
  ProductDiscountCandidate,
} from "../generated/api";

interface Tier {
  threshold: number;
  discount: number;
}

const TIERS: Tier[] = [
  { threshold: 100, discount: 10 },
  { threshold: 200, discount: 20 },
  { threshold: 300, discount: 30 },
];

function getTier(cost: number): Tier | undefined {
  return [...TIERS]
    .sort((a, b) => b.threshold - a.threshold)
    .find((tier) => cost >= tier.threshold);
}

export function cartLinesDiscountsGenerateRun(
  input: InputCartRun,
): CartLinesDiscountsGenerateRunResult {
  if (!input.cart.lines.length) {
    return { operations: [] };
  }
  const productCandidates: ProductDiscountCandidate[] = [];
  const shopTagsRaw = input.shop.metafield?.value || "{}";
  const customerTagsRaw =
    input.cart.buyerIdentity?.customer?.metafield?.value || "";
  const shopTags: Record<string, number> = JSON.parse(shopTagsRaw);
  const customerTags = customerTagsRaw.split(",").map((tag) => tag.trim());
  const extraPercentage = customerTags.reduce((sum, tag) => {
    return sum + (shopTags[tag] || 0);
  }, 0);

  for (const cartLine of input.cart.lines) {
    const cost = parseFloat(cartLine.cost.subtotalAmount.amount);
    const tier = getTier(cost);
    let fixedAmount = tier?.discount || 0;
    if (extraPercentage > 0) {
      const tagBonus = (extraPercentage / 100) * cost;
      fixedAmount += tagBonus;
    }
    if (fixedAmount > 0) {
      productCandidates.push({
        message:
          extraPercentage > 0
            ? `${fixedAmount.toFixed(
                2
              )}$ off (includes ${extraPercentage}% tag bonus)`
            : `${fixedAmount.toFixed(2)}$ off`,
        targets: [{ cartLine: { id: cartLine.id } }],
        value: {
          fixedAmount: {
            amount: fixedAmount.toFixed(2),
          },
        },
      });
    }
  }

  const result: CartLinesDiscountsGenerateRunResult = { operations: [] };
  if (productCandidates.length > 0) {
    result.operations.push({
      productDiscountsAdd: {
        candidates: productCandidates,
        selectionStrategy: ProductDiscountSelectionStrategy.All,
      },
    });
  }

  return result;
}

// import {
//   DiscountClass,
//   InputCartRun,
//   CartLinesDiscountsGenerateRunResult,
// } from "../generated/api";

// export function cartLinesDiscountsGenerateRun(
//   input: InputCartRun
// ): CartLinesDiscountsGenerateRunResult {
//   const {
//     fetchResult,
//     discount: { discountClasses },
//   } = input;

//   const body = fetchResult?.jsonBody;

//   console.log("fetchResult:", fetchResult);

//   if (!body) {
//     throw new Error("Missing response body");
//   }

//   const operations = body;

//   const hasOrderDiscountClass = discountClasses.includes(DiscountClass.Order);
//   const hasProductDiscountClass = discountClasses.includes(
//     DiscountClass.Product
//   );

//   if (!hasOrderDiscountClass && !hasProductDiscountClass) {
//     return { operations: [] };
//   }

//   const filteredOperations = operations.filter((operation) => {
//     if (operation.enteredDiscountCodesAccept) {
//       return true;
//     }

//     if (operation.orderDiscountsAdd) {
//       return hasOrderDiscountClass;
//     }

//     if (operation.productDiscountsAdd) {
//       return hasProductDiscountClass;
//     }

//     return false;
//   });

//   return { operations: filteredOperations };
// }
