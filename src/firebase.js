import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAHkiGeI0b5d7UfvhcaKx7PU_ggDG_COuc",
  authDomain: "foal-37b37.firebaseapp.com",
  projectId: "foal-37b37",
  storageBucket: "foal-37b37.firebasestorage.app",
  messagingSenderId: "948685589448",
  appId: "1:948685589448:web:acc5066bb0d6ac54c5cefd",
  measurementId: "G-J0LVSBVCC3",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
