// app/camera-prova.tsx
import React, { useRef, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Pressable,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { 
  CameraView,
  CameraMode,
  CameraType,
  useCameraPermissions
} from 'expo-camera';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Prova {
  id: string;
  nome: string;
  dataCriacao: string;
  fotos: string[];
  gabarito?: string[];
}

interface ImagemCapturada {
  id: string;
  provaId: string;
  imageUri: string;
  dataCriacao: string;
  status: 'pendente' | 'em_analise' | 'corrigido';
  resultado?: {
    acertos: number;
    total: number;
    nota: number;
  };
}

const PROVAS_STORAGE_KEY = '@GabaritoApp:provas';
const IMAGENS_STORAGE_KEY = '@GabaritoApp:imagens';

export default function CameraProvaScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [prova, setProva] = useState<Prova | null>(null);
  
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const { provaId } = useLocalSearchParams();

  useEffect(() => {
    carregarProva();
  }, []);

  const carregarProva = async () => {
    try {
      const provasArmazenadas = await AsyncStorage.getItem(PROVAS_STORAGE_KEY);
      if (provasArmazenadas) {
        const provas: Prova[] = JSON.parse(provasArmazenadas);
        const provaAtual = provas.find(p => p.id === provaId);
        if (provaAtual) {
          setProva(provaAtual);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar prova:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da prova');
    }
  };
  
  // Verificação de permissão
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F4FCD" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>Precisamos de permissão para acessar sua câmera</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Conceder permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const captureImage = async () => {
    if (!cameraRef.current) {
      console.log('Camera ref não disponível');
      return;
    }
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: true,
      });
      
      if (photo && photo.uri) {
        console.log('Foto capturada:', photo.uri);
        setCapturedImage(photo.uri);
      } else {
        throw new Error('Foto não capturada corretamente');
      }
    } catch (error) {
      console.error('Erro ao capturar imagem:', error);
      Alert.alert('Erro', 'Não foi possível capturar a imagem.');
    }
  };

  const toggleFacing = () => {
    setFacing(prev => prev === 'back' ? 'front' : 'back');
  };

  const salvarImagem = async () => {
    if (!capturedImage) {
      Alert.alert('Erro', 'Nenhuma imagem capturada');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Criar objeto da imagem capturada
      const novaImagem: ImagemCapturada = {
        id: Date.now().toString(),
        provaId: provaId as string,
        imageUri: capturedImage,
        dataCriacao: new Date().toLocaleDateString('pt-BR'),
        status: 'pendente'
      };

      // Carregar imagens existentes
      const imagensArmazenadas = await AsyncStorage.getItem(IMAGENS_STORAGE_KEY);
      let imagens: ImagemCapturada[] = [];
      
      if (imagensArmazenadas) {
        imagens = JSON.parse(imagensArmazenadas);
      }

      // Adicionar nova imagem
      imagens.push(novaImagem);
      await AsyncStorage.setItem(IMAGENS_STORAGE_KEY, JSON.stringify(imagens));

      // Atualizar a prova com a referência da nova foto
      const provasArmazenadas = await AsyncStorage.getItem(PROVAS_STORAGE_KEY);
      if (provasArmazenadas) {
        const provas: Prova[] = JSON.parse(provasArmazenadas);
        const provasAtualizadas = provas.map(p => {
          if (p.id === provaId) {
            return {
              ...p,
              fotos: [...(p.fotos || []), novaImagem.id]
            };
          }
          return p;
        });
        await AsyncStorage.setItem(PROVAS_STORAGE_KEY, JSON.stringify(provasAtualizadas));
      }
      
      Alert.alert(
        'Sucesso', 
        'Imagem salva com sucesso!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      Alert.alert('Erro', `Não foi possível salvar a imagem: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreview = () => {
    if (!capturedImage) {
      return null;
    }

    return (
      <View style={styles.previewContainer}>
        <Image 
          source={{ uri: capturedImage }} 
          style={styles.previewImage}
          resizeMode="contain"
        />
        
        <View style={styles.previewActions}>
          <TouchableOpacity 
            style={[styles.previewButton, styles.cancelButton]}
            onPress={() => setCapturedImage(null)}
            disabled={isSaving}
          >
            <Feather name="refresh-ccw" size={20} color="#FF6B6B" />
            <Text style={styles.cancelText}>Capturar novamente</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.previewButton, styles.saveButton]}
            onPress={() => {
              console.log('Botão salvar pressionado');
              salvarImagem();
            }}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Feather name="check" size={20} color="#FFF" />
                <Text style={styles.saveText}>Salvar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <>
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          facing={facing}
          mode="picture"
          mute={true}
          enableZoomGesture
          responsiveOrientationWhenOrientationLocked
        >
          <View style={styles.overlayContainer}>
            <View style={styles.frameGuide}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
            <Text style={styles.guideText}>
              Posicione a prova dentro da moldura
            </Text>
          </View>
          
          <View style={styles.shutterContainer}>
            <Pressable onPress={() => router.back()}>
              <Feather name="x" size={32} color="white" />
            </Pressable>
            
            <Pressable onPress={captureImage}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.shutterBtn,
                    {
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View style={styles.shutterBtnInner} />
                </View>
              )}
            </Pressable>
            
            <Pressable onPress={toggleFacing}>
              <Feather name="refresh-cw" size={32} color="white" />
            </Pressable>
          </View>
        </CameraView>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {capturedImage ? renderPreview() : renderCamera()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
  },
  permissionText: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#2F4FCD',
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#2F4FCD',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  frameGuide: {
    width: '80%',
    height: '60%',
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    height: 20,
    width: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#2F4FCD',
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    height: 20,
    width: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#2F4FCD',
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    height: 20,
    width: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#2F4FCD',
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    height: 20,
    width: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#2F4FCD',
  },
  guideText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  shutterContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: 'transparent',
    borderWidth: 5,
    borderColor: 'white',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2F4FCD',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  previewActions: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    justifyContent: 'space-between',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 0.48,
    // Estilo neomorphism adaptado para fundo escuro
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
  },
  cancelText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginLeft: 5,
  },
  saveButton: {
    backgroundColor: '#2F4FCD',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginLeft: 5,
  },
});