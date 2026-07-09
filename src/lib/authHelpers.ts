import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

// Register with email & password
export async function registerWithEmail(
  name: string,
  email: string,
  password: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await createUserDoc(cred.user, name);
  return cred.user;
}

// Sign in with email & password
export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// Sign in with Google
export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  await createUserDoc(cred.user, cred.user.displayName || 'User');
  return cred.user;
}

// Create user document in Firestore (only if not exists)
async function createUserDoc(user: FirebaseUser, name: string) {
  const userRef = doc(db, 'users', user.uid);
  await setDoc(
    userRef,
    {
      uid: user.uid,
      displayName: name,
      email: user.email,
      photoURL: user.photoURL || '',
      phone: '',
      isAdmin: false,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Send password reset email
export async function forgotPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

// Change password (requires current password for re-auth)
export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Not authenticated');
  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);
}

// Update profile data in Firestore
export async function updateUserProfile(
  uid: string,
  data: { displayName?: string; phone?: string; photoURL?: string }
) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
  if (auth.currentUser && data.displayName) {
    await updateProfile(auth.currentUser, {
      displayName: data.displayName,
      ...(data.photoURL ? { photoURL: data.photoURL } : {}),
    });
  }
}
