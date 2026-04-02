/**
 * Firebase / Firestore optional integration.
 * Set FIREBASE_CONFIG in env or add firebaseConfig here to enable.
 * When not configured, all operations fall back to local persistence.
 */

let db = null;
let initialized = false;

const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
};

export function initFirebase() {
  if (initialized) return !!db;
  if (!FIREBASE_CONFIG.projectId || !FIREBASE_CONFIG.apiKey) return false;
  try {
    const { initializeApp } = require("firebase/app");
    const { getFirestore } = require("firebase/firestore");
    const app = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
    initialized = true;
    return true;
  } catch (e) {
    return false;
  }
}

export function getDb() {
  if (!db) initFirebase();
  return db;
}

export function isFirebaseReady() {
  return !!getDb();
}
