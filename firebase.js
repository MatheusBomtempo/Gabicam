
// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Versão mais recente do Firebase usa getAuth() sem persistência no React Native
export const auth = getAuth(app);