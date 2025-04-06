// app/camera-prova.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CameraProvaScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const cameraRef = useRef<any>(null);
  const router = useRouter();
  const { provaId } = useLocalSearchParams();
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const onCameraReady = () => {
    setIsCameraReady(true);
  };

  const captureImage = async () => {
    if (!cameraRef.current || !isCameraReady || isCapturing) return;
    
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      setCapturedImage(photo.uri);
    } catch (error) {
      console.error('Erro ao capturar imagem:', error);
      Alert.alert('Erro', 'Não foi possível capturar a imagem.');
    } finally {
      setIsCapturing(false);
    }
  };

  const salvarImagem = async () => {
    if (!capturedImage) return;
    
    try {
      setIsSaving(true);
      
      // Simulação de upload para API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aqui você faria o upload real da imagem para sua API
      // const formData = new FormData();
      // formData.append('provaId', provaId as string);
      // formData.append('image', {
      //   uri: capturedImage,
      //   type: 'image/jpeg',
      //   name: 'prova_imagem.jpg'
      // });
      // 
      // const response = await fetch('SUA_API_URL/upload', {
      //   method: 'POST',
      //   body: formData,
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   }
      // });
      
      Alert.alert(
        'Sucesso', 
        'Imagem salva com sucesso!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      Alert.alert('Erro', 'Não foi possível salvar a imagem.');
    } finally {
      setIsSaving(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F4FCD" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>Acesso à câmera negado</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={() => router.back()}
        >
          <Text style={styles.permissionButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (capturedImage) {
              setCapturedImage(null);
            } else {
              router.back();
            }
          }}
        >
          <Feather name={capturedImage ? "x" : "arrow-left"} size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {capturedImage ? "Previsualização" : "Capturar Prova"}
        </Text>
      </View>

      {capturedImage ? (
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
              onPress={salvarImagem}
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
      ) : (
        <>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={Camera.Constants.Type.back}
            ratio="4:3"
            onCameraReady={onCameraReady}
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
          </Camera>
          
          <View style={styles.captureContainer}>
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={captureImage}
              disabled={!isCameraReady || isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator size="small" color="#2F4FCD" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
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
  },
  permissionText: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#2F4FCD',
    marginBottom: 20,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  frameGuide: {
    width: '80%',
    height: '65%',
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
  captureContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#DDDBFF',
    justifyContent: 'center',
    alignItems: 'center',
    // Estilo neomorphism adaptado para fundo escuro
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
    bottom: 30,
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