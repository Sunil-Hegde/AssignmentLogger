import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCODR_zGb2x1mz6IyBv21f6pFLK9ZsVVV0",
  authDomain: "assignmentsubmission-8b0bd.firebaseapp.com",
  projectId: "assignmentsubmission-8b0bd",
  storageBucket: "assignmentsubmission-8b0bd.appspot.com",
  messagingSenderId: "442950003992",
  appId: "1:442950003992:web:e03ba4ca29eae28560426d",
  measurementId: "G-1FDX1640X8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, getStorage, setDoc, doc, uploadString, getDownloadURL, ref };
