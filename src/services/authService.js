import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';

/**
 * Register a new user with email and password
 */
export async function signUpUser(email, password) {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Sign in existing user
 */
export const signInUser = async (email, password) => {
  const authInstance = getAuth();
  const userCredential = await signInWithEmailAndPassword(
    authInstance,
    email,
    password,
  );
  return userCredential.user;
};

export const registerUser = async (email, password) => {
  const authInstance = getAuth();
  const userCredential = await createUserWithEmailAndPassword(
    authInstance,
    email,
    password,
  );
  return userCredential.user;
};

/**
 * Sign out current user
 */
export const signOutUser = async () => {
  const authInstance = getAuth();
  return await signOut(authInstance);
};
