import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from "firebase/storage";
import {ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { deleteDoc } from "firebase/firestore";

const ApiUrl = import.meta.env.VITE_APIKEY;
const AuthDomain = import.meta.env.VITE_AUTHDOMAIN;
const ProjectID = import.meta.env.VITE_PROJECTID;
const Storage = import.meta.env.VITE_STORAGEBUCKET;
const Message = import.meta.env.VITE_MESSAGINGSENDERID;
const AppID = import.meta.env.VITE_APPID;

const firebaseConfig = {
  apiKey: ApiUrl,
  authDomain: AuthDomain,
  projectId: ProjectID,
  storageBucket: Storage,
  messagingSenderId: Message,
  appId: AppID
};

const app = initializeApp(firebaseConfig);
console.log(app.name ? "Firebase Initialized" : "Firebase Not Initialized");

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export { auth, db, signInWithEmailAndPassword, onAuthStateChanged, storage, ref, uploadBytes, getDownloadURL, deleteDoc};

