



import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDLNaUiI-xZ4HnTUl6OmNlvaY5QrgMDVUU",
    authDomain: "tutoring-de009.firebaseapp.com",
    projectId: "tutoring-de009",
    storageBucket: "tutoring-de009.appspot.com",
    messagingSenderId: "687643652917",
    appId: "1:687643652917:web:d7853dd0cecd453cbe127c",
    measurementId: "G-FFWQNJ17CK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

export { db, auth, signInWithGoogle };
