import { useState, useEffect } from 'react';
import { projectAuth, projectGoogleAuthProvider, projectFirestore } from '../firebase';
import { useAuthContext } from './useAuthContext';

export const useGoogleLogin = () => {
  const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();

  const login = async () => {
    setError(null);
    setIsPending(true);

    try {
      const res = await projectAuth.signInWithPopup(projectGoogleAuthProvider);

      if (!res) {
        throw new Error('Could not complete login');
      }

      // check if email is in specific domain.
      const { email } = res.user;
      const specificEmailDomain = '';
      if (!email.trim().endsWith(specificEmailDomain)) {
        throw new Error(`Only users who have ${specificEmailDomain} can login.`);
      }

      // check if user exists in users collection.
      const signedUser = await projectFirestore.collection('users').doc(res.user.uid).get();
      if (!signedUser.exists) {
        // create a user document
        await projectFirestore.collection('users').doc(res.user.uid).set({
          online: true,
          displayName: res.user.displayName,
          photoURL: res.user.photoURL,
        });
      }

      // dispatch login action
      dispatch({ type: 'LOGIN', payload: res.user });

      if (!isCancelled) {
        setIsPending(false);
        setError(null);
      }
    } catch (err) {
      if (!isCancelled) {
        setError(err.message);
        setIsPending(false);
      }
    }
  };

  // cancel login if get off the login page.
  useEffect(() => {
    return () => setIsCancelled(true);
  }, []);

  return { login, isPending, error };
};
