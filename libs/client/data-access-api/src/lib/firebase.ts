import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
} from 'firebase/app';
import {
  getAnalytics,
  type Analytics,
  isSupported,
} from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: 'AIzaSyBxcrkzgdhCRkCJQbu6pVIEQJpOXYbP94w',
  authDomain: 'dreamweaverstudio.firebaseapp.com',
  projectId: 'dreamweaverstudio',
  storageBucket: 'dreamweaverstudio.firebasestorage.app',
  messagingSenderId: '403829270246',
  appId: '1:403829270246:web:3aed9947e4dc3f74dffd27',
  measurementId: 'G-672FS5ZQCL',
};

export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let analytics: Analytics | null = null;

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (analytics) {
    return analytics;
  }
  if (typeof window === 'undefined') {
    return null;
  }
  const supported = await isSupported().catch(() => false);
  if (!supported) {
    return null;
  }
  analytics = getAnalytics(firebaseApp);
  return analytics;
}
