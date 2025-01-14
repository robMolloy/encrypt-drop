import { balanceSchema } from "@/db/firestoreBalancesSdk";
import { Unsubscribe } from "firebase/firestore";
import { z } from "zod";
import { create } from "zustand";

type TBalanceState = {
  balance: undefined | z.infer<typeof balanceSchema>;
  getBalance: () => undefined | z.infer<typeof balanceSchema>;
  setBalance: (x: undefined | z.infer<typeof balanceSchema>) => void;
  listeners: Unsubscribe[];
  getListeners: () => Unsubscribe[];
  setListeners: (x: Unsubscribe[]) => void;
};

const useBalanceStoreBase = create<TBalanceState>()((set, get) => ({
  balance: undefined,
  getBalance: () => get().balance,
  setBalance: (balance) => set(() => ({ balance })),
  listeners: [],
  getListeners: () => get().listeners,
  setListeners: (listeners) => set(() => ({ listeners })),
}));

export const useBalanceStore = () => {
  const balanceStoreBase = useBalanceStoreBase();
  const balance = balanceStoreBase.balance;

  return {
    ...balanceStoreBase,
    getSafeStore: () => {
      if (balance === undefined) return { status: "invalid" } as const;
      return { status: "valid", balance } as const;
    },
    clear: () => {
      if (balanceStoreBase.listeners) balanceStoreBase.listeners.forEach((x) => x());
      balanceStoreBase.setBalance(undefined);
      balanceStoreBase.setListeners([]);
    },
    addListener: (listener: Unsubscribe) => {
      balanceStoreBase.setListeners([...balanceStoreBase.getListeners(), listener]);
    },
  };
};
