import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 🔥 ADD

const firebaseConfig = {
  apiKey: "AIzaSyAyCBJHFLXynE5E13M6CvRHW7erHNyv-7U",
  authDomain: "bringing-out-d34c2.firebaseapp.com",
  projectId: "bringing-out-d34c2",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app); // 🔥 ADD