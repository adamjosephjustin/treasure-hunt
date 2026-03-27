import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Placeholder config - User needs to replace this with their actual Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let db = null;
let isFirebaseEnabled = false;

try {
  // Only attempt to initialize if project ID is provided
  if (firebaseConfig.projectId && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseEnabled = true;
    console.log("🔥 Firebase initialized successfully.");
  } else {
    console.warn("⚠️ Firebase configuration missing. Using localStorage fallback.");
  }
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
}

const LOCAL_STORAGE_KEY = 'lumina_forest_progress';

/**
 * Save progress to Firestore or localStorage
 */
export async function saveProgress(userId, progressData) {
  const data = {
    ...progressData,
    updatedAt: new Date().toISOString(),
    userId,
  };

  // Always save to localStorage as a safety net
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

  if (isFirebaseEnabled && db) {
    try {
      await setDoc(doc(db, 'players', userId), data, { merge: true });
      return true;
    } catch (error) {
      console.error("❌ Firestore save failed:", error);
    }
  }
  return false;
}

/**
 * Load progress from Firestore or localStorage
 */
export async function loadProgress(userId) {
  let localData = null;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) localData = JSON.parse(stored);
  } catch (e) {
    console.error("Error reading localStorage:", e);
  }

  if (isFirebaseEnabled && db) {
    try {
      const docSnap = await getDoc(doc(db, 'players', userId));
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        // Return whichever is newer or favor cloud if available
        return cloudData;
      }
    } catch (error) {
      console.error("❌ Firestore load failed:", error);
    }
  }

  return localData;
}

/**
 * Fetch top scores for leaderboard
 */
export async function getLeaderboard() {
  if (!isFirebaseEnabled || !db) return [];

  try {
    const q = query(
      collection(db, 'players'),
      orderBy('completedCount', 'desc'),
      orderBy('updatedAt', 'asc'),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("❌ Firestore leaderboard fetch failed:", error);
    return [];
  }
}
