// Login sem Firebase
import React, { useState } from "react";
import { Button, Text, View, Image } from "react-native";

export default function App() {
  const [user, setUser] = useState<any>(null);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {user ? (
        <>
          <Text>Bem-vindo, {user.displayName || 'Usuário'}</Text>
          <Image source={{ uri: user.photoURL || undefined }} style={{ width: 100, height: 100, borderRadius: 50 }} />
        </>
      ) : (
        <Button
          title="Entrar (fictício)"
          onPress={() => setUser({ displayName: 'Usuário', photoURL: undefined })}
        />
      )}
    </View>
  );
}
