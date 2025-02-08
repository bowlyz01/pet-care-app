import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// add your app on firebase, copy firebaseConfig here, enable email/password auth
const firebaseConfig = {
  apiKey: "AIzaSyCkaDLf-eiYrSLNoHY-f9Y__bUZCT9w0FI",
  authDomain: "pet-care-expo.firebaseapp.com",
  projectId: "pet-care-expo",
  storageBucket: "pet-care-expo.firebasestorage.app",
  messagingSenderId: "850728381712",
  appId: "1:850728381712:web:d2a473d7e33fd4d6d5c995",
  measurementId: "G-G4YVWW06ED"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app); // Export Firestore instance

// Initialize Auth
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
