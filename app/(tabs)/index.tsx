// app/index.tsx
import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  Platform,
  SafeAreaView 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';


const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.logo}>GabiCam</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleSignOut}
        >
          <Feather name="log-out" size={24} color="#2F4FCD" />
        </TouchableOpacity>
      </View>
      
      {/* <View style={styles.imageContainer}>
        <Image 
          source={require('../../assets/images/correction.jpg')} 
          style={styles.image}
          resizeMode="contain"
        />
      </View> */}
      
      <View style={styles.infoContainer}>
        <Text style={styles.title}>Corrija provas facilmente</Text>
        <Text style={styles.subtitle}>
          Capture, corrija e gerencie provas com apenas alguns toques
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>

      <TouchableOpacity 
          style={styles.buttonPrimary}
          onPress={() => router.push('/CameraProvaScreen')}
        >
          <LinearGradient
            colors={['#3B5EDE', '#2F4FCD']}
            style={styles.gradientButton}
          >
            <Feather name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.buttonTextPrimary}>TIRAR FOTO</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buttonPrimary}
          onPress={() => router.push('/CorrecaoScreen')}
        >
          <LinearGradient
            colors={['#3B5EDE', '#2F4FCD']}
            style={styles.gradientButton}
          >
            <Feather name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.buttonTextPrimary}>CORRIGIR PROVA</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.buttonPrimary}
          onPress={() => router.push('/CriarEditarProvaScreen')}
        >
          <View style={styles.buttonInner}>
            <Feather name="edit" size={20} color="#2F4FCD" />
            <Text style={styles.buttonTextSecondary}>CRIAR/EDITAR PROVA</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buttonSecondary}
          onPress={() => router.push('/TesteScreen')}
        >
          <View style={styles.buttonInner}>
            <Feather name="edit" size={20} color="#2F4FCD" />
            <Text style={styles.buttonTextSecondary}>TESTE API</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buttonSecondary}
          onPress={() => router.push('/ConfiguracoesScreen')}
        >
          <View style={styles.buttonInner}>
            <Feather name="edit" size={20} color="#2F4FCD" />
            <Text style={styles.buttonTextSecondary}>Apagar tudo</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buttonPrimary}
          onPress={() => router.push('/Loginn')}
        >
          <LinearGradient
            colors={['#3B5EDE', '#2F4FCD']}
            style={styles.gradientButton}
          >
            <Feather name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.buttonTextPrimary}>Login</Text>
          </LinearGradient>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
  },
  logo: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#2F4FCD',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  infoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#2F4FCD',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  buttonPrimary: {
    height: 56,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#2F4FCD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginLeft: 10,
  },
  buttonSecondary: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#DDDBFF',
    marginBottom: 15
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#DDDBFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  buttonTextSecondary: {
    color: '#2F4FCD',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginLeft: 10,
  },
  logoutButton: {
    padding: 8,
  },
});