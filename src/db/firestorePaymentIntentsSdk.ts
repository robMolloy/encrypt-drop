import { createSafeSdk } from "@/utils/firestoreSdkUtils/firestoreSdkUtils";
import { timestampSchema } from "@/utils/firestoreSdkUtils/firestoreUtils";
import { z } from "zod";

const paymentIntentsCollectionName = "paymentIntents";

export const paymentIntentsSchema = z.object({
  id: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const paymentIntentsSdk = createSafeSdk({
  collectionName: paymentIntentsCollectionName,
  schema: paymentIntentsSchema,
});
