import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAPEVFwdLDOrV0K3LYoBmhv5afCmWyjXmY",
  authDomain: "mascotapp-usm.firebaseapp.com",
  projectId: "mascotapp-usm",
  storageBucket: "mascotapp-usm.firebasestorage.app",
  messagingSenderId: "259001290020",
  appId: "1:259001290020:web:54730f9c51a07d640137b1",
};

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const firestore = getFirestore(firebaseApp);