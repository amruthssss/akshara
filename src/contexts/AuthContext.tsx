import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    const profileDoc = doc(db, 'users', auth.currentUser.uid, 'profile', 'data');
    try {
      const snap = await getDoc(profileDoc);
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${auth.currentUser.uid}/profile/data`);
    }
  };

  useEffect(() => {
    // Handle redirect result
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await refreshProfile();
        }
      } catch (err: any) {
        console.error('Redirect Sign-in Error:', err);
      }
    };
    handleRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await refreshProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (loading) return;
    const provider = new GoogleAuthProvider();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    try {
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request') {
        console.log('Previous popup request was cancelled or is already pending.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        console.log('Login popup was closed by user.');
      } else {
        console.error('Authentication Error:', err);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
