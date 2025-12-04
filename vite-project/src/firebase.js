// -------------------------
// Firebase Initialization
// -------------------------
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  onSnapshot,
  query
} from "firebase/firestore";

// Publically available from web app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// -------------------------------------------------
// AUTH FUNCTIONS
// -------------------------------------------------

/**
 * Popup Google login.
 * @returns user who logged in
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    console.error("Login error:", err);
  }
};

/**
 * Logs out the current user.
 */
export const logout = () => signOut(auth);

// -------------------------------------------------
// USER DOCUMENT INITIALIZATION
// /users/{uid}
// -------------------------------------------------

/**
 * Adds a user to the database upon first login.
 * @param {*} user User who logged in. Obtained from loginWithGoogle().
 */
export const ensureUserDocument = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const existing = await getDoc(userRef);

  if (!existing.exists()) {
    await setDoc(userRef, {
      email: user.email,
      joinedAt: Date.now(),
    });
  }
};

// -------------------------------------------------
// GLOBAL INSTAGRAM CACHE FUNCTIONS
// /instagramAccounts/{username}
// -------------------------------------------------

/**
 * Updates a global cache of all tracked accounts across all users.
 * If the account doesn't exist, it creates a new document in the database.
 * @param {*} username Username of the Instagram account being updated.
 * @param {*} data Data of the account being updated.
 */
export const updateInstagramCache = async (username, data) => {
  await setDoc(
    doc(db, "instagramAccounts", username),
    {
      username,
      ...data,
      lastUpdated: Date.now()
    },
    { merge: true }
  );
};

/**
 * Read the cached data of an account from the cached accounts.
 * @param {*} username Account to read.
 * @returns Account data if it exists, null otherwise.
 */
export const getInstagramCache = async (username) => {
  const snap = await getDoc(doc(db, "instagramAccounts", username));
  return snap.exists() ? snap.data() : null;
};

// -------------------------------------------------
// USER'S TRACKED ACCOUNTS (subcollection)
// /users/{uid}/trackedAccounts/{username}
// -------------------------------------------------

/**
 * Add an account to a user's tracked accounts; no duplicates.
 * @param {*} userId User adding the tracked account.
 * @param {*} username Account being added.
 * @returns true if an account was added, false otherwise
 */
export const addTrackedAccount = async (userId, username) => {
  const ref = doc(db, "users", userId, "trackedAccounts", username);
  const snap = await getDoc(ref);

  // No duplicates
  if (snap.exists()) {
    console.log(`@${username} already tracked by user`);
    return false;
  }

  await setDoc(ref, {
    username,
    addedAt: Date.now()
  });
  console.log(`@${username} added to Firestore`);
  return true;
};

/**
 * Remove an account from a user's tracked accounts.
 * @param {*} userId User removing the tracked account.
 * @param {*} username Account being removed.
 */
export const removeTrackedAccount = async (userId, username) => {
  await updateDoc(
    doc(db, "users", userId, "trackedAccounts", username),
    { removed: true }
  );
};

/**
 * Get all usernames of a user's tracked accounts.
 * Only returns usernames. To get account data, user getInstagramCache().
 * @param {*} userId User whose tracked accounts to get.
 * @returns all usernames of the user's tracked accounts
 */
export const getUserTrackedAccounts = async (userId) => {
  const q = await getDocs(collection(db, "users", userId, "trackedAccounts"));
  return q.docs.map((doc) => doc.id);
};

// -------------------------------------------------
// LISTENERS
// -------------------------------------------------

/**
 * Real-time listener for a user's tracked accounts.
 * Call this function when a user is logged in.
 * @param {*} userId User whose tracked accounts to listen to.
 * @param {*} callback A function that takes in an array of usernames; called whenever the tracked accounts change.
 * @returns unsubscribe function to stop listening
 */
export const listenUserTrackedAccounts = (userId, callback) => {
  const colRef = collection(db, "users", userId, "trackedAccounts");
  return onSnapshot(
    colRef,
    (snap) => {
      const accounts = snap.docs.map((doc) => doc.id);
      callback(accounts);
    });
};

/**
 * Real-time listener for an Instagram account's cached data.
 * Call this function for each account that is currently being viewed (all tracked accounts of current user).
 * @param {*} username Account whose cached data to listen to.
 * @param {*} callback A function that takes in the account data; called whenever the cached data changes (i.e. new post).
 * @returns unsubscribe function to stop listening
 */
export const listenInstagramCache = (username, callback) => {
  const ref = doc(db, "instagramAccounts", username);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });
};

export { auth, db };