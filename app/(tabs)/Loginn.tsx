// Login.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../firebase'; // Importando a configuração do Firebase

// Redirecionamento para OAuth
WebBrowser.maybeCompleteAuthSession();

// Suas credenciais do Google
// Você precisa configurar estas credenciais no Google Cloud Console
const ANDROID_CLIENT_ID = "448832247805-t0g9c2b8t59fnukuchuflvo0c01vtlb4.apps.googleusercontent.com"; // Adicione seu Android client ID 
const WEB_CLIENT_ID = "448832247805-u7h1qis1bsv6437hbp1poj8lsdd3ihqb.apps.googleusercontent.com"; // Adicione seu Web client ID

export default function Login() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Configuração do Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    expoClientId: WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      setLoading(true);
      const { id_token } = response.params;
      
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(result => {
          setUser(result.user);
          console.log("Usuário logado com sucesso:", result.user);
          // Aqui você pode navegar para a próxima tela após o login
        })
        .catch(error => {
          console.error("Erro ao fazer login com Google:", error);
          setError('Ocorreu um erro durante o login. Tente novamente.');
        })
        .finally(() => setLoading(false));
    }
  }, [response]);

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error("Erro ao iniciar login com Google:", error);
      setError('Não foi possível iniciar o processo de login. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/google-logo.png')} 
          style={styles.logo}
          // Substitua pelo caminho da sua logo
        />
        <Text style={styles.welcomeText}>Bem-vindo</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4285F4" />
      ) : (
        <TouchableOpacity 
          style={styles.googleButton}
          onPress={handleSignIn}
          disabled={!request}
        >
          <Image 
            source={require('../../assets/images/google-logo.png')} 
            style={styles.googleIcon}
            // Substitua pelo caminho do ícone do Google
          />
          <Text style={styles.googleButtonText}>
            Entrar com Google
          </Text>
        </TouchableOpacity>
      )}
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      {user && (
        <View style={styles.userInfoContainer}>
          <Text style={styles.successText}>
            Login realizado com sucesso!
          </Text>
          <Text style={styles.userEmail}>
            {user.email}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    width: '100%',
    maxWidth: 300,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  errorText: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
  userInfoContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 10,
  },
  userEmail: {
    fontSize: 16,
    color: '#333',
  },
});