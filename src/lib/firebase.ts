/**
 * @module firebase
 * @description Firebase client SDK initialization.
 * Provides singleton instances of Auth, Firestore, and Analytics.
 * Uses VITE_ prefixed env vars for client-side access.
 *
 * @security API keys are safe to expose client-side — Firebase Security Rules
 * enforce access control server-side. Never expose service account keys here.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import {
  getAnalytics,
  isSupported,
  type Analytics,
} from "firebase/analytics";

/** Firebase configuration from environment variables */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/**
 * Validates that all required Firebase config values are present.
 * Throws a descriptive error listing missing variables.
 */
function validateConfig(): void {
  const required = [
    "apiKey",
    "authDomain",
    "projectId",
    "appId",
  ] as const;

  const missing = required.filter(
    (key) => !firebaseConfig[key]
  );

  if (missing.length > 0) {
    const vars = missing.map(
      (k) => `VITE_FIREBASE_${k.replace(/([A-Z])/g, "_$1").toUpperCase()}`
    );
    console.error(
      `[Firebase] Missing config: ${vars.join(", ")}. Add them to your .env file.`
    );
  }
}

// ─── Singleton Initialization ─────────────────────────────────────────────────

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _analytics: Analytics | null = null;

/**
 * Returns the Firebase app singleton, initializing it on first call.
 * Safe to call multiple times — uses `getApps()` guard.
 */
function getApp(): FirebaseApp {
  if (!_app) {
    validateConfig();
    _app =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp(firebaseConfig);
  }
  return _app;
}

/** Firebase Auth instance */
export const auth: Auth = (() => {
  if (!_auth) {
    _auth = getAuth(getApp());

    // Connect to emulator in development
    if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_AUTH_EMULATOR) {
      connectAuthEmulator(
        _auth,
        import.meta.env.VITE_FIREBASE_AUTH_EMULATOR,
        { disableWarnings: true }
      );
    }
  }
  return _auth;
})();

/** Firestore database instance */
export const db: Firestore = (() => {
  if (!_db) {
    _db = getFirestore(getApp());

    // Connect to emulator in development
    if (import.meta.env.DEV && import.meta.env.VITE_FIRESTORE_EMULATOR_HOST) {
      const [host, port] = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST.split(":");
      connectFirestoreEmulator(_db, host, parseInt(port, 10));
    }
  }
  return _db;
})();

/**
 * Firebase Analytics instance (lazy, async).
 * Analytics is only supported in browser environments.
 * Returns `null` if unsupported (SSR, privacy extensions, etc.).
 */
export async function getAnalyticsInstance(): Promise<Analytics | null> {
  if (_analytics) return _analytics;

  try {
    const supported = await isSupported();
    if (supported) {
      _analytics = getAnalytics(getApp());
    }
  } catch {
    // Analytics not available — silently degrade
    console.warn("[Firebase] Analytics not supported in this environment.");
  }
  return _analytics;
}

/** Firestore collection names — single source of truth */
export const COLLECTIONS = {
  USERS: "users",
  USER_PROFILES: "user_profiles",
  DAILY_CHECKINS: "daily_checkins",
  JOURNAL_ENTRIES: "journal_entries",
  WELLNESS_SCORES: "wellness_scores",
  WELLNESS_INSIGHTS: "wellness_insights",
  WELLNESS_TASKS: "wellness_tasks",
  ACHIEVEMENTS: "achievements",
  STREAKS: "streaks",
  NOTIFICATIONS: "notifications",
  PARENT_LINKS: "parent_links",
  COUNSELOR_ACCESS: "counselor_access",
  AI_CONVERSATIONS: "ai_conversations",
  SAFETY_EVENTS: "safety_events",
} as const;
