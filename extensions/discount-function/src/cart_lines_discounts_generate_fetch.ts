import {
  HttpRequestMethod,
  InputCartFetch,
  CartLinesDiscountsGenerateFetchResult,
} from "../generated/api";

export function cartLinesDiscountsGenerateFetch(
  input: InputCartFetch
): CartLinesDiscountsGenerateFetchResult {
  const request: CartLinesDiscountsGenerateFetchResult["request"] = {
    headers: [],
    method: HttpRequestMethod.Get,
    policy: {
      readTimeoutMs: 5000,
    },
    url: "https://afac-2400-74e0-0-3a7f-8187-9f97-5fe8-7c57.ngrok-free.app/api",
  };
  return { request };
}
