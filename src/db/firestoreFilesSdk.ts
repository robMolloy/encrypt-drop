import { z } from "zod";
import { createSafeSdk, TDb } from "@/utils/firestoreSdkUtils/firestoreSdkUtils";
import { balanceSchema } from "./firestoreBalancesSdk";
import { timestampSchema } from "@/utils/firestoreSdkUtils/firestoreUtils";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const filesCollectionName = "files";

export const fileSchema = z.object({
  id: z.string(),
  uid: z.string(),
  name: z.string(),
  serializedEncryptionKeySalt: z.string(),
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
    const response = z.array(fileSchema).safeParse(docs);

    if (response.success) p.onValidData(response.data);
  });

  return unsub;
};

export const filesSdk = {
  ...initFilesSdk,
  subscribeToMyFiles,
};
