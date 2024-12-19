import { getStorage } from "firebase-admin/storage";
import { initializeApp, cert } from "firebase-admin/app";
import nexusServiceAcct from "./serviceAccountKey.js";
import env from "./env.js";

export const firebase = initializeApp({
  credential: cert(nexusServiceAcct as unknown as string),
  storageBucket: env.FIREBASE.STORAGE_BUCKET,
});

export const storage = getStorage(firebase);
