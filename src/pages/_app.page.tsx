import { Typography } from "@/components";
import { auth, db } from "@/config/firebaseConfig";
import { balanceSchema, balancesSdk } from "@/db/firestoreBalancesSdk";
import { UserAuthCreateLoginForm } from "@/modules/authUserForm";
import { Layout } from "@/modules/layout";
import { Notify } from "@/modules/notify";
import { useAuthStore, useAuthStoreBase } from "@/stores/useAuthStore";
import "@/styles/globals.css";
import { onAuthStateChanged } from "firebase/auth";
import { Unsubscribe } from "firebase/firestore";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import { z } from "zod";
import { create } from "zustand";

type TBalanceState = {
  balance: undefined | z.infer<typeof balanceSchema>;
  setBalance: (x: undefined | z.infer<typeof balanceSchema>) => void;
  listener: undefined | Unsubscribe;
  setListener: (x: undefined | Unsubscribe) => void;
};
const useBalanceStoreBase = create<TBalanceState>()((set, _) => ({
  balance: undefined,
  setBalance: (balance) => set(() => ({ balance })),
  listener: undefined,
  setListener: (listener) => set(() => ({ listener })),
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
  };
};

export default function App({ Component, pageProps }: AppProps) {
  const authStoreBase = useAuthStoreBase();
  const authStore = useAuthStore();
  const safeAuthStore = authStore.getSafeStore();
  const balanceStore = useBalanceStore();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      authStoreBase.setUser(user);

      const uid = user?.uid;
      if (!uid) return;

      const unsub = balancesSdk.subscribeToBalance({
        db,
        id: uid,
        onValidData: (x) => {
          balanceStore.setBalance(x);
        },
      });

      balanceStore.setListener(unsub);
    });
  }, []);
  return (
    <>
      <Head>
        <title>next-daisyui-fire-starter</title>
      </Head>

      <Notify />

      <Layout>
        {safeAuthStore.status === "loading" && <div>Loading...</div>}
        {safeAuthStore.status === "logged_in" && <Component {...pageProps} />}
        {safeAuthStore.status === "logged_out" && (
          <Typography fullPage>
            <UserAuthCreateLoginForm />
          </Typography>
        )}
      </Layout>
    </>
  );
}
