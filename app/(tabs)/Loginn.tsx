// Login sem Firebase
import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Login() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      setUser({ displayName: 'Usuário', email: 'usuario@email.com' });
      setLoading(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/google-logo.png')} 
          style={styles.logo}
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
        >
          <Image 
            source={require('../../assets/images/google-logo.png')} 
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>
            Entrar (fictício)
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