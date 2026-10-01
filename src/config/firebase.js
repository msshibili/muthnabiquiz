import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  onSnapshot,
  query, 
  where, 
  orderBy,
  addDoc
} from 'firebase/firestore';

// Active Firebase Configuration for muthnabiquiz project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDwMY1OmwnUnXGUN0zNNOLT9mN3eFIDzuA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "muthnabiquiz.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "muthnabiquiz",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "muthnabiquiz.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1092882783548",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1092882783548:web:f37794565ba0c6c10dd239"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Real Firebase is 100% active on all devices & deployments
export const isRealFirebaseConfigured = true;

export default app;
