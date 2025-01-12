// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

export const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";
export const emulatorOffline = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR_OFFLINE === "true";

const initFirebaseConfig = {
  apiKey: "AIzaSyCewPJhmBtpn6QWXhx2MRrtY7UxaOZfOW4",
  authDomain: "encryptdrop.firebaseapp.com",
  projectId: "encryptdrop",
  storageBucket: "encryptdrop.firebasestorage.app",
  messagingSenderId: "352557738491",
  appId: "1:352557738491:web:6cf71ea7f33e25475a835e",
};
const projectId = `${useEmulator ? "demo-" : ""}${initFirebaseConfig.projectId}`;
const firebaseConfig = { ...initFirebaseConfig, projectId };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);

if (useEmulator) {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}
