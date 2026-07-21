'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phone?: string;
  isAdmin: boolean;
  referralCode?: string;
  rewardPoints?: number;
  referredBy?: string;
  firstOrderUsed?: boolean;
  referCodeDiscountType?: string;
  referCodeDiscountValue?: number;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        let referralCode = data.referralCode;
        if (!referralCode) {
          referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
          await setDoc(userRef, { referralCode }, { merge: true });
        }
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: data.displayName || firebaseUser.displayName,
          photoURL: data.photoURL || firebaseUser.photoURL,
          phone: data.phone || '',
          isAdmin: data.isAdmin || false,
          referralCode: referralCode,
          rewardPoints: data.rewardPoints || 0,
          referredBy: data.referredBy || '',
          // If firstOrderUsed is explicitly stored, use it.
          // If not stored: if user was referred (has referredBy), default false (they haven't used it yet).
          // Otherwise default true (no discount available).
          firstOrderUsed: data.firstOrderUsed !== undefined
            ? data.firstOrderUsed
            : (data.referredBy ? false : true),
          referCodeDiscountType: data.referCodeDiscountType || '',
          referCodeDiscountValue: data.referCodeDiscountValue || 0,
        });

      } else {
        // Document will be created by authHelpers.ts during signup
        const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAdmin: false,
          referralCode: referralCode,
          rewardPoints: 0,
          referredBy: '',
          firstOrderUsed: true,
          referCodeDiscountType: '',
          referCodeDiscountValue: 0,
        });
      }
    } catch {
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAdmin: false,
      });
    }
  };

  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await loadUserData(currentUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserData(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
