import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import type { User, UserRole, Student, Teacher, Parent, Admin } from '@/types';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  name: string;
  role: UserRole;
}

class FirebaseAuthService {
  // Current user state
  private currentUser: User | null = null;

  // Initialize auth state listener
  initAuthListener(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          this.currentUser = userDoc.data() as User;
          callback(this.currentUser);
        } else {
          callback(null);
        }
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }

  // Sign up with email and password
  async signUp(data: SignUpData): Promise<User> {
    try {
      // Create Firebase auth user
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Update display name
      await updateProfile(firebaseUser, { displayName: data.name });
      
      // Send verification email
      await sendEmailVerification(firebaseUser);
      
      // Create user document in Firestore with proper structure based on role
      const baseUserData = {
        id: firebaseUser.uid,
        email: data.email,
        name: data.name,
        isActive: true,
        preferences: {
          theme: 'light' as const,
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false,
            inApp: true,
            digest: 'weekly' as const,
            types: {
              assignments: true,
              grades: true,
              messages: true,
              reminders: true
            }
          },
          privacy: {
            profileVisibility: 'school' as const,
            shareProgress: true,
            allowAnalytics: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      let userData: User;

      switch (data.role) {
        case 'student':
          userData = {
            ...baseUserData,
            role: 'student',
            gradeLevel: 10,
            schoolId: 'default-school',
            enrolledClasses: [],
            parentIds: [],
            learningProfile: {
              learningStyle: 'mixed',
              pace: 'normal',
              strengths: [],
              weaknesses: [],
              interests: [],
              goals: []
            }
          } as Student;
          break;
        case 'teacher':
          userData = {
            ...baseUserData,
            role: 'teacher',
            schoolId: 'default-school',
            subjectIds: [],
            classIds: [],
            qualifications: []
          } as Teacher;
          break;
        case 'parent':
          userData = {
            ...baseUserData,
            role: 'parent',
            childrenIds: [],
            subscription: {
              id: `sub-${Date.now()}`,
              plan: 'free',
              status: 'active',
              startedAt: new Date(),
              features: []
            }
          } as Parent;
          break;
        case 'admin':
          userData = {
            ...baseUserData,
            role: 'admin',
            permissions: []
          } as Admin;
          break;
        default:
          throw new Error('Invalid role');
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      this.currentUser = userData;
      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  }

  // Sign in with email and password
  async signIn(credentials: AuthCredentials): Promise<User> {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Fetch user data
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data() as User;
      
      // Update last login
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      this.currentUser = userData;
      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);

      // Check if user exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        this.currentUser = userData;
        return userData;
      } else {
        // Create new user (default to student role)
        const newUser: Student = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          avatar: firebaseUser.photoURL || undefined,
          role: 'student',
          isActive: true,
          gradeLevel: 10,
          schoolId: 'default-school',
          enrolledClasses: [],
          parentIds: [],
          learningProfile: {
            learningStyle: 'mixed',
            pace: 'normal',
            strengths: [],
            weaknesses: [],
            interests: [],
            goals: []
          },
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: {
              email: true,
              push: true,
              sms: false,
              inApp: true,
              digest: 'weekly',
              types: {
                assignments: true,
                grades: true,
                messages: true,
                reminders: true
              }
            },
            privacy: {
              profileVisibility: 'school',
              shareProgress: true,
              allowAnalytics: true
            }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        this.currentUser = newUser;
        return newUser;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();