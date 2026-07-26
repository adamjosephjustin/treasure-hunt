import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// ── Firebase configuration (Adams Pictionary project) ───────
const firebaseConfig = {
  apiKey: "AIzaSyBEagJW7NPmPOzxNGAWRbJLk_ExvITuRKs",
  authDomain: "adams-pictionary.firebaseapp.com",
  databaseURL: "https://adams-pictionary-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "adams-pictionary",
  storageBucket: "adams-pictionary.firebasestorage.app",
  messagingSenderId: "452825963356",
  appId: "1:452825963356:web:9641a7b0dcd91d8aa07f99",
  measurementId: "G-4KPRQ9TGPS"
};

// ── Initialize Firebase ─────────────────────────────────────
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

let isFirebaseEnabled = true;

// ── Anonymous Auth helper ───────────────────────────────────

let authReadyPromise = null;

/**
 * Ensure the user is signed in anonymously.
 * Returns the Firebase User object.
 */
export async function ensureAuth() {
  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve, reject) => {
      const unsub = onAuthStateChanged(auth, async (user) => {
        unsub();
        if (user) {
          resolve(user);
        } else {
          try {
            const cred = await signInAnonymously(auth);
            resolve(cred.user);
          } catch (err) {
            console.error('❌ Anonymous auth failed:', err);
            reject(err);
          }
        }
      });
    });
  }
  return authReadyPromise;
}

/** Get current user UID (assumes auth is ready) */
export function getUid() {
  return auth.currentUser?.uid || null;
}

// ── Re-export Firestore helpers for convenience ─────────────
export {
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
};

// ── Legacy progress functions (preserved for existing game) ─

const LOCAL_STORAGE_KEY = 'lumina_forest_progress';

export async function saveProgress(userId, progressData) {
  const data = {
    ...progressData,
    updatedAt: new Date().toISOString(),
    userId,
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

  if (isFirebaseEnabled && db) {
    try {
      await setDoc(doc(db, 'players', userId), data, { merge: true });
      return true;
    } catch (error) {
      console.error('❌ Firestore save failed:', error);
    }
  }
  return false;
}

export async function loadProgress(userId) {
  let localData = null;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) localData = JSON.parse(stored);
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }

  if (isFirebaseEnabled && db) {
    try {
      const docSnap = await getDoc(doc(db, 'players', userId));
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (error) {
      console.error('❌ Firestore load failed:', error);
    }
  }
  return localData;
}

export async function getLeaderboard() {
  if (!isFirebaseEnabled || !db) return [];
  try {
    const q = query(
      collection(db, 'players'),
      orderBy('completedCount', 'desc'),
      orderBy('updatedAt', 'asc'),
      limit(5)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('❌ Firestore leaderboard fetch failed:', error);
    return [];
  }
}
