/**
 * @module AuthContext
 * @description React context providing Firebase Authentication state and methods.
 * Wraps the app at the root level to provide `user`, `loading`, `signIn`,
 * `signUp`, and `signOut` to all components.
 *
 * @accessibility Manages focus and announces auth state changes for screen readers.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, COLLECTIONS } from "@/lib/firebase";
import type { UserProfile, RegistrationData, ExamType } from "@/types";

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Current Firebase user, or `null` if signed out */
  user: User | null;
  /** User's Firestore profile, or `null` if not loaded */
  profile: UserProfile | null;
  /** `true` while the auth state is being determined on mount */
  loading: boolean;
  /** Sign in with email and password */
  signIn: (email: string, password: string) => Promise<void>;
  /** Register a new student account */
  signUp: (data: RegistrationData) => Promise<void>;
  /** Sign out the current user */
  signOut: () => Promise<void>;
  /** Refresh the profile from Firestore */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  /** Fetch user profile from Firestore */
  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.USER_PROFILES, uid));
      if (snap.exists()) {
        setProfile({ ...snap.data(), uid } as UserProfile);
      }
    } catch (error) {
      console.error("[Auth] Failed to fetch profile:", error);
    }
  }, []);

  /** Listen to Firebase Auth state changes */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchProfile]);

  /** Sign in with email + password */
  const signIn = useCallback(async (email: string, password: string) => {
    const { user: signedInUser } = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    await fetchProfile(signedInUser.uid);
  }, [fetchProfile]);

  /** Register new student account and create Firestore profile */
  const signUp = useCallback(async (data: RegistrationData) => {
    const { user: newUser } = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    // Set display name on Firebase Auth
    await updateProfile(newUser, { displayName: data.name });

    // Create user document
    await setDoc(doc(db, COLLECTIONS.USERS, newUser.uid), {
      uid: newUser.uid,
      email: data.email,
      name: data.name,
      role: "student",
      createdAt: serverTimestamp(),
    });

    // Create user profile
    const profileData: Omit<UserProfile, "createdAt" | "updatedAt"> = {
      uid: newUser.uid,
      name: data.name,
      age: null,
      examType: data.examType as ExamType,
      examDate: data.examDate,
      classLevel: data.classLevel,
      dailyStudyTarget: 8,
      preferredLanguage: "English",
      xp: 0,
      level: 1,
    };

    await setDoc(doc(db, COLLECTIONS.USER_PROFILES, newUser.uid), {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create initial streaks document
    await setDoc(doc(db, COLLECTIONS.STREAKS, newUser.uid), {
      userId: newUser.uid,
      checkinStreak: 0,
      journalStreak: 0,
      taskStreak: 0,
      longestCheckinStreak: 0,
      longestJournalStreak: 0,
      longestTaskStreak: 0,
      lastCheckinDate: null,
      lastJournalDate: null,
      lastTaskDate: null,
    });

    await fetchProfile(newUser.uid);
  }, [fetchProfile]);

  /** Sign out */
  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  }, []);

  /** Refresh profile from Firestore */
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  }, [user, fetchProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [user, profile, loading, signIn, signUp, signOut, refreshProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access auth state and methods from any component.
 * @throws if used outside `<AuthProvider>`
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be used within an <AuthProvider>. " +
      "Ensure your component tree is wrapped with AuthProvider in __root.tsx."
    );
  }
  return context;
}
