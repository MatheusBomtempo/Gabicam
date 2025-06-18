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
      
      <View style={styles.gridContainer}>
        {/* Criar Prova - Botão Principal */}
        <TouchableOpacity 
          style={styles.mainButton}
          onPress={() => router.push('/CriarEditarProvaScreen')}
        >
          <LinearGradient
            colors={['#3B5EDE', '#2F4FCD']}
            style={styles.mainButtonGradient}
          >
            <View style={styles.mainButtonContent}>
              <View style={styles.mainIconContainer}>
                <Feather name="file-text" size={36} color="#2F4FCD" />
              </View>
              <View style={styles.mainTextContainer}>
                <Text style={styles.mainButtonText}>Criar Prova</Text>
                <Text style={styles.mainButtonSubtext}>Primeiro passo</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Tirar Foto - Ação Principal */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/CameraProvaScreen')}
        >
          <View style={styles.actionButtonContent}>
            <View style={styles.actionIconContainer}>
              <Feather name="camera" size={32} color="#2F4FCD" />
            </View>
            <Text style={styles.actionButtonText}>Tirar Foto</Text>
          </View>
        </TouchableOpacity>

        {/* Corrigir Provas - Ação Principal */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/CorrecaoScreen')}
        >
          <View style={styles.actionButtonContent}>
            <View style={styles.actionIconContainer}>
              <Feather name="check-circle" size={32} color="#2F4FCD" />
            </View>
            <Text style={styles.actionButtonText}>Corrigir Provas</Text>
          </View>
        </TouchableOpacity>

        {/* Configurações - Funcionalidade Isolada */}
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/ConfiguracoesScreen')}
        >
          <View style={styles.settingsButtonContent}>
            <View style={styles.settingsIconContainer}>
              <Feather name="settings" size={28} color="#666" />
            </View>
            <Text style={styles.settingsButtonText}>Configurações</Text>
          </View>
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
    fontFamily: 'System',
    fontWeight: '700',
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
    fontFamily: 'System',
    fontWeight: '700',
    color: '#2F4FCD',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  mainButton: {
    width: '100%',
    height: 120,
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: '#DDDBFF',
    elevation: 12,
    shadowColor: '#2F4FCD',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  mainButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButtonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mainIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'System',
    fontWeight: '700',
    textAlign: 'left',
  },
  mainButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '400',
    textAlign: 'left',
    marginTop: 4,
  },
  actionButton: {
    width: '48%',
    height: 120,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#DDDBFF',
    elevation: 8,
    shadowColor: '#2F4FCD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  actionButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#2F4FCD',
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
    textAlign: 'center',
  },
  settingsButton: {
    width: '48%',
    height: 120,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#F5F5F7',
    elevation: 4,
    shadowColor: '#666',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  settingsButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  settingsIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingsButtonText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutButton: {
    padding: 8,
  },
});