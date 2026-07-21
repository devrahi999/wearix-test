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
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { getUserByReferralCode, getReferralSettings, createReferral } from './db';

// Register with email & password
export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
  referredBy?: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await createUserDoc(cred.user, name, referredBy);
  return cred.user;
}

// Sign in with email & password
export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// Sign in with Google
export async function loginWithGoogle(referredBy?: string) {
  const cred = await signInWithPopup(auth, googleProvider);
  await createUserDoc(cred.user, cred.user.displayName || 'User', referredBy);
  return cred.user;
}

// Create user document in Firestore (only if not exists)
async function createUserDoc(user: FirebaseUser, name: string, referredBy?: string) {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    const data: any = {
      uid: user.uid,
      displayName: name,
      email: user.email,
      photoURL: user.photoURL || '',
      phone: '',
      isAdmin: false,
      referralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      createdAt: serverTimestamp(),
    };
    if (referredBy) {
      data.referredBy = referredBy;
      data.firstOrderUsed = false;
      
      try {
        const refUser = await getUserByReferralCode(referredBy);
        const refSettings = await getReferralSettings();
        
        let rType = 'percent';
        let rVal = 10;
        
        if (refUser && refSettings?.isActive) {
          const isGloballyEnabled = refSettings.isReferredDiscountEnabled !== false;
          const isUserEnabled = refUser.isReferredDiscountEnabled !== false;
          
          if (isGloballyEnabled && isUserEnabled) {
            if (refUser.referCodeDiscountType) {
              rType = refUser.referCodeDiscountType;
              rVal = refUser.referCodeDiscountValue || 0;
            } else if (refUser.customReferralDiscount) {
              rType = 'percent';
              rVal = refUser.customReferralDiscount;
            } else {
              rType = refSettings.discountType || 'percent';
              rVal = refSettings.discountValue || refSettings.defaultReferralDiscountPct || 10;
            }
          }
        }
        
        data.referCodeDiscountType = rType;
        data.referCodeDiscountValue = rVal;
      } catch (err) {
        console.error('Error fetching referral details during signup', err);
      }
    }
    await setDoc(userRef, data);
    
    // Create the referral record if referred
    if (referredBy && data.referCodeDiscountType) {
      try {
        const refUser = await getUserByReferralCode(referredBy);
        if (refUser) {
          await createReferral({
            referrerId: refUser.id,
            referredUserId: user.uid,
            referredUserEmail: user.email || 'No Email',
            status: 'pending',
            orderId: '',
            earnedPoints: 0
          });
        }
      } catch (err) {
        console.error('Error creating referral record', err);
      }
    }
  }
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

// Set password for the first time (e.g., Google auth users)
export async function setPasswordOnly(newPassword: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
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
