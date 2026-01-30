import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';

import { firebaseApp } from '@dreamweaverstudio/client-data-access-api';

let authInitPromise: Promise<User | null> | null = null;

export function getAuthState(): Promise<User | null> {
  if (!authInitPromise) {
    authInitPromise = new Promise((resolve) => {
      const auth = getAuth(firebaseApp);
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }
  return authInitPromise;
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  const auth = getAuth(firebaseApp);
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<User> {
  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<User> {
  const auth = getAuth(firebaseApp);
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  const auth = getAuth(firebaseApp);
  await signOut(auth);
}

export function isAuthenticatedSync(): boolean {
  const auth = getAuth(firebaseApp);
  return Boolean(auth.currentUser);
}
