import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBrdPXffz_zo7-qpywMXaIZYLWRSYDGMPw",
  authDomain: "matchapp-jk.firebaseapp.com",
  projectId: "matchapp-jk",
  storageBucket: "matchapp-jk.appspot.com",
  messagingSenderId: "944882650771",
  appId: "1:944882650771:web:2f058d6654c56b65a1c766",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
