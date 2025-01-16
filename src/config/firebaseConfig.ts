import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

const prodFirebaseConfig = {
  projectId: "encryptdrop",
  apiKey: "AIzaSyCewPJhmBtpn6QWXhx2MRrtY7UxaOZfOW4",
  authDomain: "encryptdrop.firebaseapp.com",
  storageBucket: "encryptdrop.firebasestorage.app",
  messagingSenderId: "352557738491",
  appId: "1:352557738491:web:6cf71ea7f33e25475a835e",
};
const emulatorProjectId = "demo-project";
const emulatorFirebaseConfig = {
  projectId: emulatorProjectId,
  apiKey: emulatorProjectId,
  authDomain: emulatorProjectId,
  storageBucket: emulatorProjectId,
  messagingSenderId: emulatorProjectId,
  appId: emulatorProjectId,
} satisfies typeof prodFirebaseConfig;

const firebaseConfig = useEmulator ? emulatorFirebaseConfig : prodFirebaseConfig;
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

if (useEmulator) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}
