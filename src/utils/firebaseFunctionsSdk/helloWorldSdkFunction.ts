import { httpsCallable } from "firebase/functions";
import { functions } from "../../config/firebaseConfig";
import { z } from "zod";

const helloWorldFn = httpsCallable(functions, "helloWorld");

const successResponseSchema = z.object({
  data: z.object({
    success: z.literal(true),
    data: z.string(),
  }),
});

export const helloWorld = async () => {
  const response = await helloWorldFn();
  const parsedResponse = successResponseSchema.safeParse(response);

  if (!parsedResponse.success) return { success: false } as const;
  return {
    success: parsedResponse.success,
    data: parsedResponse.data.data.data,
  } as const;
};
