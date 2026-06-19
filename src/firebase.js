import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';

// ── Firebase config (values come from .env) ─────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ── CRUD helpers ─────────────────────────────────────────────────────

/** Save a new design, returns the new Firestore document ID */
export async function saveDesign(data) {
  const ref = await addDoc(collection(db, 'designs'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Overwrite an existing design by ID */
export async function updateDesign(id, data) {
  await updateDoc(doc(db, 'designs', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Fetch all designs, newest first */
export async function getDesigns() {
  const q = query(collection(db, 'designs'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Delete a design by ID */
export async function deleteDesign(id) {
  await deleteDoc(doc(db, 'designs', id));
}
