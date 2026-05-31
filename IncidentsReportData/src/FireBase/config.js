// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";      //------------- esto es para la base de datos
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZdz9s7yRdDBF0z8fc9hkQ16E4ldFcTkM",
  authDomain: "proyecto-web-65b12.firebaseapp.com",
  projectId: "proyecto-web-65b12",
  storageBucket: "proyecto-web-65b12.firebasestorage.app",
  messagingSenderId: "1052697651492",
  appId: "1:1052697651492:web:dc2ea64744d61c6fbdebb1",
  measurementId: "G-Q2WE1C0DX7"
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(appFirebase);

export default appFirebase;   //------------- esto es para exportar la configuración de Firebase a otros archivos

export const db = getFirestore(appFirebase);   //------------- esto es para la base de datos (agregar EXPORT para poder usarlo en otros archivos)
export const storage = getStorage(appFirebase);