import { httpsCallable } from "firebase/functions";
import { functions } from "../../config/firebaseConfig";
import { z } from "zod";

const createStripePaymentIntentFn = httpsCallable(
  functions,
  "createStripePaymentIntent"
);

const successResponseSchema = z.object({
  data: z.object({
    success: z.literal(true),
    data: z.object({ client_secret: z.string() }),
  }),
});

export const createStripePaymentIntent = async (p: {
  amount: number;
  currency: string;
}) => {
  const response = await createStripePaymentIntentFn(p);
  const parsedResponse = successResponseSchema.safeParse(response);

  if (!parsedResponse.success) return { success: false } as const;
  return {
    success: parsedResponse.success,
    data: parsedResponse.data.data.data,
  } as const;
};
