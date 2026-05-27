import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-tDI4NFYSe4MDmtaWBCTeYBnlgcyrs",
  authDomain: "warehouse-3d-5a5b7.firebaseapp.com",
  projectId: "warehouse-3d-5a5b7",
  storageBucket: "warehouse-3d-5a5b7.appspot.com",
  messagingSenderId: "390671630581",
  appId: "1:390671630581:web:9b219dfce2776a069745bc"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);