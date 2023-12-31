import { initializeApp } from "firebase/app";
import { getAuth, sendEmailVerification, fetchSignInMethodsForEmail, signInWithEmailAndPassword,  } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, query, orderBy , limit, updateDoc, where } from 'firebase/firestore';
import { getStorage, uploadBytes, put, getDownloadURL, listAll} from 'firebase/storage'
import { getDatabase, ref, push } from 'firebase/database';
import {
  REACT_NATIVE_FIREBASE_EXTENSION_API_KEY,
  REACT_NATIVE_FIREBASE_EXTENSION_AUTH_DOMAIN,
  REACT_NATIVE_FIREBASE_EXTENSION_PROJECT_ID,
  REACT_NATIVE_FIREBASE_EXTENSION_STORAGE_BUCKET,
  REACT_NATIVE_FIREBASE_EXTENSION_MESSAGING_SENDER_ID,
  REACT_NATIVE_FIREBASE_EXTENSION_APP_ID,
  REACT_NATIVE_FIREBASE_EXTENSION_MEASUREMENT_ID
} from '@env';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAt0aqfqquvfQAGL-TTw3n5PsQ5qUxtak0",
  authDomain: "sample-form-98a7b.firebaseapp.com",
  projectId: "sample-form-98a7b",
  storageBucket: "sample-form-98a7b.appspot.com",
  messagingSenderId: "566240852343",
  appId: "1:566240852343:web:b5ad204075a40a03ae8972",
  measurementId: "G-WS70BNTXRN"
};
const firebaseConfigExtension = {
  // Replace with your project 2 configuration
  apiKey: REACT_NATIVE_FIREBASE_EXTENSION_API_KEY,
  authDomain: REACT_NATIVE_FIREBASE_EXTENSION_AUTH_DOMAIN,
  projectId: REACT_NATIVE_FIREBASE_EXTENSION_PROJECT_ID,
  storageBucket: REACT_NATIVE_FIREBASE_EXTENSION_STORAGE_BUCKET,
  messagingSenderId: REACT_NATIVE_FIREBASE_EXTENSION_MESSAGING_SENDER_ID,
  appId: REACT_NATIVE_FIREBASE_EXTENSION_APP_ID,
  measurementId: REACT_NATIVE_FIREBASE_EXTENSION_MEASUREMENT_ID,


};

//Second firebase


export const projectExtensionFirebase = initializeApp(firebaseConfigExtension, 'projectExtension');
export const projectExtensionAuth = getAuth(projectExtensionFirebase);
export const projectExtensionFirestore = getFirestore(projectExtensionFirebase);
export const projectExtensionStorage = getStorage(projectExtensionFirebase);
//Second Firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app);
export const auth = getAuth();
export {app, getFirestore, collection, addDoc, db, doc, setDoc, getDoc, sendEmailVerification, fetchSignInMethodsForEmail, signInWithEmailAndPassword, getStorage, ref, uploadBytes, getDownloadURL, storage, getDatabase, push, database, getDocs, listAll,  query, orderBy, limit, updateDoc, where};
