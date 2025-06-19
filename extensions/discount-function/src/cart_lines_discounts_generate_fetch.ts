import {
  HttpRequestMethod,
  InputCartFetch,
  CartLinesDiscountsGenerateFetchResult,
} from "../generated/api";

export function cartLinesDiscountsGenerateFetch(
  input: InputCartFetch
): CartLinesDiscountsGenerateFetchResult {
  const request: CartLinesDiscountsGenerateFetchResult["request"] = {
    headers: [{ name: "accept", value: "application/json" }],
    method: HttpRequestMethod.Get,
    policy: {
      readTimeoutMs: 5000,
    },
    url: "https://5f36-2400-74e0-0-3a7f-498a-d68c-ebc7-2232.ngrok-free.app/",
  };
  return { request };
}
