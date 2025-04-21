// web 448832247805-u7h1qis1bsv6437hbp1poj8lsdd3ihqb.apps.googleusercontent.com
// android 448832247805-t0g9c2b8t59fnukuchuflvo0c01vtlb4.apps.googleusercontent.com

import React, { useEffect, useState } from "react";
import { Button, Text, View, Image } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/firebaseConfig";
import {
  getAuth,
  onAuthStateChanged, 
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/firebase";
import { makeRedirectUri } from "expo-auth-session";



// Inicializa o Firebase
initializeApp(firebaseConfig);
WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [user, setUser] = useState<any>(null);
  const auth = getAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "448832247805-t0g9c2b8t59fnukuchuflvo0c01vtlb4.apps.googleusercontent.com",
    webClientId: "448832247805-u7h1qis1bsv6437hbp1poj8lsdd3ihqb.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({}),
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { idToken } = response.authentication!;
      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {user ? (
        <>
          <Text>Bem-vindo, {user.displayName}</Text>
          <Image source={{ uri: user.photoURL }} style={{ width: 100, height: 100, borderRadius: 50 }} />
        </>
      ) : (
        <Button
          disabled={!request}
          title="Entrar com Google"
          onPress={() => promptAsync()}
        />
      )}
    </View>
  );
}
