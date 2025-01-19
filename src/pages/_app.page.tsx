import { Typography } from "@/components";
import { auth, db } from "@/config/firebaseConfig";
import { balancesSdk } from "@/db/firestoreBalancesSdk";
import { filesSdk } from "@/db/firestoreFilesSdk";
import { UserAuthCreateLoginForm } from "@/modules/authUserForm";
import { Layout } from "@/modules/layout";
import { Notify } from "@/modules/notify";
import { useAuthStore, useAuthStoreBase } from "@/stores/useAuthStore";
import { useBalanceStore } from "@/stores/useBalanceStore";
import { useFilesStore } from "@/stores/useFilesStore";
import "@/styles/globals.css";
import { onAuthStateChanged } from "firebase/auth";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const authStoreBase = useAuthStoreBase();
  const authStore = useAuthStore();
  const safeAuthStore = authStore.getSafeStore();
  const balanceStore = useBalanceStore();
  const filesStore = useFilesStore();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      authStoreBase.setUser(user);

      if (!user) return balanceStore.clear();

      const balanceUnsubscribeListener = balancesSdk.subscribeToBalance({
        db,
        id: user.uid,
        onValidData: (x) => balanceStore.setBalance(x),
      });

      balanceStore.addListener(balanceUnsubscribeListener);

      const myFilesUnsubscribeListener = filesSdk.subscribeToMyFiles({
        db,
        uid: user.uid,
        onValidData: (x) => filesStore.setDocs(x),
      });

      filesStore.addListener(myFilesUnsubscribeListener);
    });
  }, []);
  return (
    <>
      <Head>
        <title>EncryptDrop</title>
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
