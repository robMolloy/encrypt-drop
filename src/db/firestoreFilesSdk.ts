import { z } from "zod";
import { createSafeSdk, TDb } from "@/utils/firestoreSdkUtils/firestoreSdkUtils";
import { balanceSchema } from "./firestoreBalancesSdk";
import { timestampSchema } from "@/utils/firestoreSdkUtils/firestoreUtils";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const filesCollectionName = "files";

export const fileSchema = z.object({
  id: z.string(),
  uid: z.string(),
  fileName: z.string(),
  serializedEncryptionKeySalt: z.string(),
  serializedInitializationVector: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

const initFilesSdk = createSafeSdk({
  collectionName: filesCollectionName,
  schema: fileSchema,
});

export const getNextFileId = (p: { balance: z.infer<typeof balanceSchema> }) =>
  `${p.balance.uid}_${p.balance.couponStream}_${p.balance.numberOfCoupons}`;

const subscribeToMyFiles = (p: {
  db: TDb;
  uid: string;
  onValidData: (x: z.infer<typeof fileSchema>[]) => void;
}) => {
  const q = query(collection(p.db, filesCollectionName), where("uid", "==", p.uid));

  const unsub = onSnapshot(q, (querySnapshot) => {
    const docs = querySnapshot.docs.map((x) => x.data());
    const parsedDocs = docs.map((x) => fileSchema.safeParse(x));

    const successDocs = [...parsedDocs]
      .filter((x) => x.success)
      .map((x) => x.data)
      .filter((x) => x !== undefined);
    const failedDocs = [...parsedDocs].filter((x) => !x.success).map((x) => x.error);

    const success = successDocs.length > 0 || (successDocs.length === 0 && failedDocs.length === 0);

    if (success) return p.onValidData(successDocs);
    console.error(`firestoreFilesSdk.ts:${/*LL*/ 37}`, { failedDocs });
  });

  return unsub;
};

export const filesSdk = {
  ...initFilesSdk,
  subscribeToMyFiles,
};
