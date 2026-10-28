import { Platform } from 'react-native';
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
  appleAuthProvider,
  signOut,
} from '@react-native-firebase/auth';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import * as Crypto from 'expo-crypto';

/**
 * Configure Google Sign-In on app launch.
 */
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    // Make sure this matches your Web Client ID from Firebase Console
    webClientId:
      '500833231264-jg0qbqn8kr2ka7f80hnk16irmhf5b4e8.apps.googleusercontent.com',
    offlineAccess: false,
    scopes: ['profile', 'email'],
  });
};

/**
 * Google Sign-In
 */
export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // 1. Prompt Google sign in
    await GoogleSignin.signIn();

    // 2. Fetch both idToken and accessToken from Google Play Services
    const { idToken, accessToken } = await GoogleSignin.getTokens();

    if (!idToken && !accessToken) {
      throw new Error('No tokens received from Google.');
    }

    // 3. Create Firebase credential with both tokens
    const authInstance = getAuth();
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const userCredential = await signInWithCredential(authInstance, credential);

    return { success: true, user: userCredential.user };
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, cancelled: true };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return { success: false, inProgress: true };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return { success: false, error: 'Google Play Services not available.' };
    }
    console.error('Google Sign-In Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Apple Sign-In (iOS only)
 *
 */

export const signInWithApple = async () => {
  if (Platform.OS !== 'ios') {
    return { success: false, error: 'Apple Sign-In is only available on iOS.' };
  }

  try {
    const rawNonce = Math.random().toString(36).substring(2, 10);
    const hashedNonce = await Crypto.digestStringSync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce,
    );

    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      nonce: hashedNonce,
    });

    const { identityToken, fullName } = appleAuthRequestResponse;
    if (!identityToken) {
      throw new Error('Apple Sign-In failed - no identity token returned.');
    }

    const authInstance = getAuth();
    const credential = appleAuthProvider.credential(identityToken, rawNonce);
    const userCredential = await signInWithCredential(authInstance, credential);

    // Format the full name if provided by Apple
    let appleDisplayName = null;
    if (fullName && (fullName.givenName || fullName.familyName)) {
      appleDisplayName = [fullName.givenName, fullName.familyName]
        .filter(Boolean)
        .join(' ');
    }

    return {
      success: true,
      user: userCredential.user,
      displayName: appleDisplayName, // 👈 Send captured name to caller
    };
  } catch (error) {
    if (error.code === appleAuth.Error.CANCELED) {
      return { success: false, cancelled: true };
    }
    console.error('Apple Sign-In Error:', error);
    return { success: false, error: error.message };
  }
};
// export const signInWithApple = async () => {
//   if (Platform.OS !== 'ios') {
//     return { success: false, error: 'Apple Sign-In is only available on iOS.' };
//   }

//   try {
//     const appleAuthRequestResponse = await appleAuth.performRequest({
//       requestedOperation: appleAuth.Operation.LOGIN,
//       requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
//     });

//     const { identityToken, nonce } = appleAuthRequestResponse;
//     if (!identityToken) {
//       throw new Error('Apple Sign-In failed - no identity token returned.');
//     }

//     const authInstance = getAuth();
//     const credential = appleAuthProvider.credential(identityToken, nonce);
//     const userCredential = await signInWithCredential(authInstance, credential);

//     return { success: true, user: userCredential.user };
//   } catch (error) {
//     if (error.code === appleAuth.Error.CANCELED) {
//       return { success: false, cancelled: true };
//     }
//     console.error('Apple Sign-In Error:', error);
//     return { success: false, error: error.message };
//   }
// };

/**
 * Sign Out
 */
export const signOutUser = async () => {
  try {
    if (await GoogleSignin.isSignedIn()) {
      await GoogleSignin.signOut();
    }
  } catch (e) {
    // Continue even if Google sign-out threw
  }
  const authInstance = getAuth();
  return await signOut(authInstance);
};
