/**
 * Firestore User Profile with Custom Fields (Map<string, any>).
 * Document path: users/{userId}
 * Structure: { customFields: { "Favorite Wines": "Merlot", ... } }
 */

import { getDb, isFirebaseReady } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const COLLECTION = "users";

export async function getProfile(userId) {
  if (!isFirebaseReady()) return null;
  try {
    const ref = doc(getDb(), COLLECTION, userId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

export async function setCustomField(userId, fieldKey, value) {
  if (!isFirebaseReady()) return false;
  try {
    const ref = doc(getDb(), COLLECTION, userId);
    const snap = await getDoc(ref);
    const customFields = (snap.exists() ? snap.data().customFields : {}) || {};
    customFields[fieldKey] = value;
    if (snap.exists()) {
      await updateDoc(ref, {
        customFields,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        customFields,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return true;
  } catch {
    return false;
  }
}

export async function removeCustomField(userId, fieldKey) {
  if (!isFirebaseReady()) return false;
  try {
    const ref = doc(getDb(), COLLECTION, userId);
    const snap = await getDoc(ref);
    const customFields = (snap.exists() ? snap.data().customFields : {}) || {};
    delete customFields[fieldKey];
    await updateDoc(ref, { customFields, updatedAt: serverTimestamp() });
    return true;
  } catch {
    return false;
  }
}
