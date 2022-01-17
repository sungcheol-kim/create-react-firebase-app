// @see https://github.com/facebook/create-react-app/issues/11756
// we could not use dotenv for above issue. ㅜㅜ

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};

// init firebase
firebase.initializeApp(firebaseConfig);

// init service
const projectFirestore = firebase.firestore();
const projectAuth = firebase.auth();
const projectStorage = firebase.storage();
const projectGoogleAuthProvider = new firebase.auth.GoogleAuthProvider();
projectGoogleAuthProvider.setCustomParameters({ prompt: 'select_account' });

// timestamp
// we need it to create timestamp in firebase date format.
const timestamp = firebase.firestore.Timestamp;
const userAuthToken = async () => {
  try {
    const token = await projectAuth.currentUser.getIdToken();
    return token;
  } catch (error) {
    alert(error.message);
    throw error;
  }
};

export { projectFirestore, projectAuth, projectGoogleAuthProvider, projectStorage, timestamp, userAuthToken };
