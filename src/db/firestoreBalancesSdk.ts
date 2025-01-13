import { z } from "zod";
import { createSafeSdk, timestampSchema } from "@/utils/firestoreSdkUtils/firestoreSdkUtils";

const balancesCollectionName = "balances";

const balanceSchema = z.object({
  id: z.string(),
  uid: z.string(),
  couponStream: z.number(),
  number_of_coupons: z.number(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const balancesSdk = createSafeSdk({
  collectionName: balancesCollectionName,
  schema: balanceSchema,
});
