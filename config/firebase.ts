import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import googleServices from "../google-services.json";

// La configuración se lee desde google-services.json (el archivo que entrega
// Firebase al registrar la app Android), en lugar de escribir las claves a mano.
const proyecto = googleServices.project_info;
const cliente = googleServices.client[0];

const firebaseConfig = {
  apiKey: cliente.api_key[0].current_key,
  authDomain: `${proyecto.project_id}.firebaseapp.com`,
  projectId: proyecto.project_id,
  storageBucket: proyecto.storage_bucket,
  messagingSenderId: proyecto.project_number,
  appId: cliente.client_info.mobilesdk_app_id,
};

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const firestore = getFirestore(firebaseApp);