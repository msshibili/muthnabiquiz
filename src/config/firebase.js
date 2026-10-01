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
  query, 
  where, 
  orderBy,
  addDoc
} from 'firebase/firestore';

// Default Firebase Configuration (can be overridden by environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKey_ReplaceWithYourFirebaseApiKey",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "muthnabi-quiz-26.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "muthnabi-quiz-26",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "muthnabi-quiz-26.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abc123def456"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Check if real Firebase keys are configured
export const isRealFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_API_KEY !== "AIzaSyDummyKey_ReplaceWithYourFirebaseApiKey"
);

export default app;
