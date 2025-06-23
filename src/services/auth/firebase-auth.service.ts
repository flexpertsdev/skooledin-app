import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  type User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import type { User, UserRole } from '@/types';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  name: string;
  role: UserRole;
  gradeLevel?: number;
}

class FirebaseAuthService {
  private currentUser: User | null = null;

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        this.currentUser = await this.getUserData(firebaseUser.uid);
      } else {
        this.currentUser = null;
      }
    });
  }

  // Sign up new user
  async signUp(data: SignUpData): Promise<User> {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      const firebaseUser = userCredential.user;
      
      // Update display name
      await updateProfile(firebaseUser, {
        displayName: data.name
      });
      
      // Send email verification
      await sendEmailVerification(firebaseUser);
      
      // Create user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        email: data.email,
        name: data.name,
        role: data.role,
        avatar: null,
        status: 'active',
        isVerified: false,
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        },
        metadata: {
          lastActive: new Date(),
          loginCount: 1,
          platform: 'web'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add role-specific data
      if (data.role === 'student' && data.gradeLevel) {
        (userData as any).gradeLevel = data.gradeLevel;
        (userData as any).subjects = [];
        (userData as any).learningProfile = {
          style: 'visual',
          pace: 'moderate',
          strengths: [],
          challenges: []
        };
      }
      
      // Save to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      this.currentUser = userData;
      return userData;
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  }

  // Sign in existing user
  async signIn(credentials: AuthCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      const userData = await this.getUserData(userCredential.user.uid);
      
      // Update last active
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        'metadata.lastActive': serverTimestamp(),
        'metadata.loginCount': (userData.metadata?.loginCount || 0) + 1
      });
      
      this.currentUser = userData;
      return userData;
    } catch (error) {
      console.error('SignIn error:', error);
      throw error;
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists
      let userData = await this.getUserData(result.user.uid).catch(() => null);
      
      if (!userData) {
        // Create new user
        userData = {
          id: result.user.uid,
          email: result.user.email!,
          name: result.user.displayName || 'User',
          role: 'student', // Default role
          avatar: result.user.photoURL,
          status: 'active',
          isVerified: result.user.emailVerified,
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: {
              email: true,
              push: true,
              sms: false
            }
          },
          metadata: {
            lastActive: new Date(),
            loginCount: 1,
            platform: 'web'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(doc(db, 'users', result.user.uid), {
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      this.currentUser = userData;
      return userData;
    } catch (error) {
      console.error('Google SignIn error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error) {
      console.error('SignOut error:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get user data from Firestore
  private async getUserData(uid: string): Promise<User> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }
    
    return {
      id: uid,
      ...userDoc.data()
    } as User;
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(updates: Partial<User>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }
    
    try {
      await updateDoc(doc(db, 'users', this.currentUser.id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Update local user data
      this.currentUser = {
        ...this.currentUser,
        ...updates
      };
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await this.getUserData(firebaseUser.uid);
        callback(userData);
      } else {
        callback(null);
      }
    });
  }
}

export const firebaseAuthService = new FirebaseAuthService();