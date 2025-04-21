import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Suas credenciais Firebase - substitua pelos seus valores reais!
export const firebaseConfig = {
    apiKey: "AIzaSyAib9xogqMLuKMfd5438cES-pS7g_xxp58",
    authDomain: "aularodrigo-e2fe6.firebaseapp.com",
    projectId: "aularodrigo-e2fe6",
    storageBucket: "aularodrigo-e2fe6.firebasestorage.app",
    messagingSenderId: "952795222281",
    appId: "1:952795222281:web:fe2d0066cd7210264bc3d8"
  };
// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth com persistência para React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };