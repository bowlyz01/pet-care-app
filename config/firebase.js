import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// add your app on firebase, copy firebaseConfig here, enable email/password auth
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app); // Export Firestore instance

// Initialize Auth
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
