import { z } from "zod";
import { createSafeSdk, TDb, timestampSchema } from "@/utils/firestoreSdkUtils/firestoreSdkUtils";
import { doc, onSnapshot, serverTimestamp } from "firebase/firestore";

export const balancesCollectionName = "balances";

export const balanceSchema = z.object({
  id: z.string(),
  uid: z.string(),
  couponStream: z.number(),
  numberOfCoupons: z.number(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

const initBalancesSdk = createSafeSdk({
  collectionName: balancesCollectionName,
  schema: balanceSchema,
});

const createInitialBalance = async (p: { db: TDb; uid: string }) => {
  return initBalancesSdk.setDoc({
    db: p.db,
    data: {
      id: p.uid,
      uid: p.uid,
      couponStream: 0,
      numberOfCoupons: 10,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  });
};

const subscribeToBalance = (p: {
  db: TDb;
  id: string;
  onValidData: (x: z.infer<typeof balanceSchema>) => void;
}) => {
  const docRef = doc(p.db, balancesCollectionName, p.id);

  const unsub = onSnapshot(docRef, (docSnapshot) => {
    const data = docSnapshot.data();
    const response = balanceSchema.safeParse(data);

    if (response.success) p.onValidData(response.data);
  });

  return unsub;
};

export const balancesSdk = { ...initBalancesSdk, createInitialBalance, subscribeToBalance };
