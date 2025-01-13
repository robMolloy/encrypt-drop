import { z } from "zod";
import { createSafeSdk, timestampSchema } from "@/utils/firestoreSdkUtils/firestoreSdkUtils";

const balancesCollectionName = "balances";

export const balanceSchema = z.object({
  id: z.string(),
  uid: z.string(),
  couponStream: z.number(),
  numberOfCoupons: z.number(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const balancesSdk = createSafeSdk({
  collectionName: balancesCollectionName,
  schema: balanceSchema,
});
