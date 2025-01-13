import {
  deleteDoc,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  QueryConstraint,
  setDoc,
  updateDoc,
  Firestore,
} from "firebase/firestore";
import { z } from "zod";
import { TServerTimestamp } from "./firestoreUtils";

// export type TDb = ReturnType<ReturnType<RulesTestEnvironment["authenticatedContext"]>["firestore"]>;
export type TDb = Firestore;
export const timestampSchema = z.object({ seconds: z.number(), nanoseconds: z.number() });

type CreatifyDoc<T1 extends object> = Omit<T1, "createdAt" | "updatedAt"> & {
  createdAt: TServerTimestamp;
  updatedAt: TServerTimestamp;
};
type UpdatifyDoc<T1 extends object> = Omit<T1, "updatedAt"> & { updatedAt: TServerTimestamp };

export const createSdk = <T1 extends { id: string }>(x: { collectionName: string }) => ({
  addDoc: (p: { db: TDb; data: T1 }) => {
    const collRef = collection(p.db, x.collectionName, p.data.id);
    return addDoc(collRef, p.data);
  },
  setDoc: (p: { db: TDb; data: T1 }) => {
    const docRef = doc(p.db, x.collectionName, p.data.id);
    return setDoc(docRef, p.data);
  },
  updateDoc: (p: { db: TDb; data: T1 }) => {
    const docRef = doc(p.db, x.collectionName, p.data.id);
    return updateDoc(docRef, p.data);
  },
  getDoc: (p: { db: TDb; id: string }) => {
    const docRef = doc(p.db, x.collectionName, p.id);
    return getDoc(docRef);
  },
  deleteDoc: (p: { db: TDb; id: string }) => {
    const docRef = doc(p.db, x.collectionName, p.id);
    return deleteDoc(docRef);
  },
  getDocs: (p: { db: TDb; queryConstraints: QueryConstraint[] }) => {
    const q = query(collection(p.db, x.collectionName), ...p.queryConstraints);
    return getDocs(q);
  },
});

export const createSafeSdk = <T1 extends z.ZodObject<{ id: z.ZodString }>>(x: {
  collectionName: string;
  schema: T1;
}) => {
  const getSafeDoc = async (p: { db: TDb; id: string }) => {
    const docRef = doc(p.db, x.collectionName, p.id);
    const result = await getDoc(docRef);
    return x.schema.safeParse(result.data());
  };

  return {
    setDoc: async (p: { db: TDb; data: CreatifyDoc<z.infer<T1>> }) => {
      try {
        const docRef = doc(p.db, x.collectionName, p.data.id);
        await setDoc(docRef, p.data);
        return { success: true } as const;
      } catch (error) {
        return { success: false, error } as const;
      }
    },
    setThenGetDoc: async (p: { db: TDb; data: CreatifyDoc<z.infer<T1>> }) => {
      try {
        const docRef = doc(p.db, x.collectionName, p.data.id);
        await setDoc(docRef, p.data);

        return getSafeDoc({ db: p.db, id: p.data.id });
      } catch (error) {
        return { success: false, error } as const;
      }
    },
    updateDoc: async (p: { db: TDb; data: UpdatifyDoc<z.infer<T1>> }) => {
      try {
        const docRef = doc(p.db, x.collectionName, p.data.id);
        await updateDoc(docRef, p.data);
        return { success: true } as const;
      } catch (error) {
        return { success: false, error } as const;
      }
    },
    updateThenGetDoc: async (p: { db: TDb; data: z.infer<T1> }) => {
      try {
        const docRef = doc(p.db, x.collectionName, p.data.id);
        await updateDoc(docRef, p.data);
        return getSafeDoc({ db: p.db, id: p.data.id });
      } catch (error) {
        return { success: false, error };
      }
    },
    deleteDoc: async (p: { db: TDb; id: string }) => {
      try {
        const docRef = doc(p.db, x.collectionName, p.id);
        await deleteDoc(docRef);
        return { success: true } as const;
      } catch (error) {
        return { success: false, error } as const;
      }
    },

    getDoc: getSafeDoc,
    getDocs: async (p: { db: TDb; queryConstraints: QueryConstraint[] }) => {
      const q = query(collection(p.db, x.collectionName), ...p.queryConstraints);
      const docs = await getDocs(q);

      return z.array(x.schema).safeParse(docs.docs);
    },
  };
};
