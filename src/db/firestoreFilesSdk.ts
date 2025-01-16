import { z } from "zod";
import { createSafeSdk } from "@/utils/firestoreSdkUtils/firestoreSdkUtils";
import { balanceSchema } from "./firestoreBalancesSdk";
import { timestampSchema } from "@/utils/firestoreSdkUtils/firestoreUtils";

const filesCollectionName = "files";

export const filesSchema = z.object({
  id: z.string(),
  uid: z.string(),
  name: z.string(),
  serializedEncryptionKeySalt: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const filesSdk = createSafeSdk({
  collectionName: filesCollectionName,
  schema: filesSchema,
});

export const getNextFileId = (p: { balance: z.infer<typeof balanceSchema> }) =>
  `${p.balance.uid}_${p.balance.couponStream}_${p.balance.numberOfCoupons}`;
