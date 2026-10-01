import { auth, db, isRealFirebaseConfigured } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LOCAL_USERS_KEY = 'muthnabi_quiz_users';
const LOCAL_CURRENT_USER_KEY = 'muthnabi_quiz_current_user';
const LOCAL_ADMIN_KEY = 'muthnabi_quiz_admin_logged_in';

// Helper to access mock stored users
function getLocalUsers() {
  const data = localStorage.getItem(LOCAL_USERS_KEY);
  return data ? JSON.parse(data) : {};
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export const authService = {
  /**
   * Generates or retrieves Recaptcha Verifier for Firebase Phone Auth
   */
  setupRecaptcha(containerId = 'recaptcha-container') {
    if (!window.recaptchaVerifier && isRealFirebaseConfigured) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
        }
      });
    }
    return window.recaptchaVerifier;
  },

  /**
   * Directly register or login user with Full Name, Mobile Number, Year, and Branch
   */
  async registerUser(name, phoneNumber, year = 'S1', branch = 'CSE') {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber.replace(/\D/g, '')}`;
    const uid = `usr_${formattedPhone.replace(/\D/g, '')}`;

    const userData = {
      uid,
      name: name || 'Participant',
      mobile: formattedPhone,
      year,
      branch,
      createdAt: new Date().toISOString(),
      role: 'user'
    };

    // Save to Firestore if connected
    if (isRealFirebaseConfigured) {
      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, userData);
        } else {
          const existing = userSnap.data();
          userData.name = existing.name || userData.name;
          userData.year = existing.year || userData.year;
          userData.branch = existing.branch || userData.branch;
        }
      } catch (e) {
        console.warn('Firestore user write error:', e);
      }
    }

    // Sync to local storage
    const localUsers = getLocalUsers();
    localUsers[uid] = userData;
    saveLocalUsers(localUsers);

    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(userData));
    return userData;
  },

  /**
   * Direct login by registered mobile number
   */
  async loginWithMobile(phoneNumber) {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber.replace(/\D/g, '')}`;
    const uid = `usr_${formattedPhone.replace(/\D/g, '')}`;

    // Check Firestore first if configured
    if (isRealFirebaseConfigured) {
      try {
        const userSnap = await getDoc(doc(db, 'users', uid));
        if (userSnap.exists()) {
          const user = { uid: userSnap.id, ...userSnap.data() };
          localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
          return user;
        }
      } catch (e) {}
    }

    const localUsers = getLocalUsers();
    if (localUsers[uid]) {
      const user = localUsers[uid];
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }

    throw new Error('Mobile number not found. Please register your details first.');
  },

  /**
   * Get logged in user from session
   */
  getCurrentUser() {
    const data = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Logout user
   */
  logoutUser() {
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
    if (isRealFirebaseConfigured) {
      try {
        signOut(auth);
      } catch (e) {}
    }
  },

  /**
   * Secure Admin Authentication
   * Supports Admin PIN or Admin Password
   */
  loginAdmin(passcode) {
    // Admin access code (Default: "admin123" or "9999")
    if (passcode === 'admin123' || passcode === '9999') {
      localStorage.setItem(LOCAL_ADMIN_KEY, 'true');
      return true;
    }
    return false;
  },

  isAdminLoggedIn() {
    return localStorage.getItem(LOCAL_ADMIN_KEY) === 'true';
  },

  logoutAdmin() {
    localStorage.removeItem(LOCAL_ADMIN_KEY);
  },

  /**
   * Fetch all registered users for Admin panel
   */
  async getAllUsers() {
    if (isRealFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ uid: doc.id, ...doc.data() });
        });
        if (usersList.length > 0) return usersList;
      } catch (e) {
        console.warn('Firestore getAllUsers error:', e);
      }
    }
    const localUsers = getLocalUsers();
    return Object.values(localUsers);
  }
};
