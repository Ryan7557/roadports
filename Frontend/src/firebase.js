// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAz-S0yKpuvwUJW6cc0qi9mFAz-OsaYI0k",
  authDomain: "zimroads-d3cbd.firebaseapp.com",
  projectId: "zimroads-d3cbd",
  storageBucket: "zimroads-d3cbd.firebasestorage.app",
  messagingSenderId: "664924316599",
  appId: "1:664924316599:web:689505426a7e34450cbe32",
  measurementId: "G-879W6LXLB2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth, analytics };
export default app;
