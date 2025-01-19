import { createStripePaymentIntent } from "./createStripePaymentIntentSdkFunction";
import { helloWorld } from "./helloWorldSdkFunction";
import { isPaymentIntentStatusSucceeded } from "./isPaymentIntentStatusSucceededSdkFunction";

export const firebaseFunctionsSdk = {
  createStripePaymentIntent,
  helloWorld,
  isPaymentIntentStatusSucceeded,
};
