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
  Platform,
  TextInput,
  ScrollView,
  Dimensions
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
import { Picker } from '@react-native-picker/picker';
import * as ImageManipulator from 'expo-image-manipulator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  nomeAluno: string;
  nomeProva: string;
  imageUri: string;
  imageCroppedUri?: string; // Nova propriedade para a imagem recortada
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
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [provas, setProvas] = useState<Prova[]>([]);
  const [selectedProvaId, setSelectedProvaId] = useState<string>('');
  const [nomeAluno, setNomeAluno] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [flashMode, setFlashMode] = useState('off');
  
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  // Dimensões para o quadro de recorte - ajustado para proporção da folha A4 com o gabarito
  const FRAME_WIDTH = SCREEN_WIDTH * 0.85;
  const FRAME_HEIGHT = FRAME_WIDTH * 1.2; // Proporção aproximada do gabarito na imagem de exemplo

  useEffect(() => {
    carregarProvas();
  }, []);

  const carregarProvas = async () => {
    try {
      const provasArmazenadas = await AsyncStorage.getItem(PROVAS_STORAGE_KEY);
      if (provasArmazenadas) {
        const provasData: Prova[] = JSON.parse(provasArmazenadas);
        // Filtrar apenas provas que têm gabarito
        const provasComGabarito = provasData.filter(p => p.gabarito && p.gabarito.length > 0);
        setProvas(provasComGabarito);
        
        if (provasComGabarito.length > 0) {
          setSelectedProvaId(provasComGabarito[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar provas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as provas');
    }
  };

  const iniciarCaptura = () => {
    if (!selectedProvaId) {
      Alert.alert('Erro', 'Selecione uma prova/gabarito');
      return;
    }
    if (!nomeAluno.trim()) {
      Alert.alert('Erro', 'Digite o nome do aluno');
      return;
    }
    setShowCamera(true);
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

  // Função para recortar apenas a área do gabarito
  const cropGabaritoArea = async (imageUri: string) => {
    try {
      setIsProcessing(true);
      
      // Obtém as dimensões da imagem capturada
      const { width: photoWidth, height: photoHeight } = await new Promise((resolve) => {
        Image.getSize(imageUri, (width, height) => {
          resolve({ width, height });
        });
      });
      
      // Calcula as coordenadas para o recorte centralizado na imagem
      // Temos que mapear as coordenadas da view para as coordenadas reais da imagem
      // Aproximadamente, assumindo que a câmera está centralizada
      const viewWidth = SCREEN_WIDTH;
      const centerX = photoWidth / 2;
      const centerY = photoHeight / 2;
      
      // Largura e altura do recorte na imagem (baseado na proporção da moldura na tela)
      const cropWidth = (FRAME_WIDTH / viewWidth) * photoWidth;
      const cropHeight = (FRAME_HEIGHT / viewWidth) * photoWidth; // mantém a proporção
      
      // Coordenadas para o recorte
      const originX = centerX - (cropWidth / 2);
      const originY = centerY - (cropHeight / 2);
      
      console.log('Dimensões da imagem:', photoWidth, photoHeight);
      console.log('Dimensões do recorte:', cropWidth, cropHeight);
      console.log('Origem do recorte:', originX, originY);
      
      // Aplica o recorte
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: Math.max(0, originX),
              originY: Math.max(0, originY),
              width: Math.min(cropWidth, photoWidth - originX),
              height: Math.min(cropHeight, photoHeight - originY),
            },
          }
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // Simplificando - apenas usando as operações básicas suportadas
      const enhancedResult = await ImageManipulator.manipulateAsync(
        manipResult.uri,
        [],  // Sem operações adicionais
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      console.log('Imagem recortada e melhorada:', enhancedResult.uri);
      setCroppedImage(enhancedResult.uri);
      return enhancedResult.uri;
    } catch (error) {
      console.error('Erro ao recortar imagem:', error);
      Alert.alert('Erro', 'Não foi possível processar a imagem. Tente novamente.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const captureImage = async () => {
    if (!cameraRef.current) {
      console.log('Camera ref não disponível');
      return;
    }
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: false, // Permitir processamento da imagem
      });
      
      if (photo && photo.uri) {
        console.log('Foto capturada:', photo.uri);
        setCapturedImage(photo.uri);
        
        // Inicia o processamento da imagem automaticamente
        const croppedUri = await cropGabaritoArea(photo.uri);
        if (croppedUri) {
          setCroppedImage(croppedUri);
        }
      } else {
        throw new Error('Foto não capturada corretamente');
      }
    } catch (error) {
      console.error('Erro ao capturar imagem:', error);
      Alert.alert('Erro', 'Não foi possível capturar a imagem.');
    }
  };

  const toggleFlash = () => {
    setFlashMode(prev => prev === 'off' ? 'on' : 'off');
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
      
      // Encontrar a prova selecionada
      const provaSelecionada = provas.find(p => p.id === selectedProvaId);
      if (!provaSelecionada) {
        throw new Error('Prova não encontrada');
      }

      // Criar objeto da imagem capturada
      const novaImagem: ImagemCapturada = {
        id: Date.now().toString(),
        provaId: selectedProvaId,
        nomeAluno: nomeAluno.trim(),
        nomeProva: provaSelecionada.nome,
        imageUri: capturedImage,
        imageCroppedUri: croppedImage || undefined, // Inclui a versão recortada
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
        const provasData: Prova[] = JSON.parse(provasArmazenadas);
        const provasAtualizadas = provasData.map(p => {
          if (p.id === selectedProvaId) {
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

  const renderFormulario = () => {
    return (
      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Nova Captura</Text>
          <Text style={styles.formSubtitle}>Preencha os dados antes de tirar a foto</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Selecione a Prova/Gabarito</Text>
          {provas.length > 0 ? (
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedProvaId}
                onValueChange={(itemValue) => setSelectedProvaId(itemValue)}
                style={styles.picker}
                dropdownIconColor="#2F4FCD"
              >
                {provas.map((prova) => (
                  <Picker.Item 
                    key={prova.id} 
                    label={prova.nome} 
                    value={prova.id} 
                  />
                ))}
              </Picker>
            </View>
          ) : (
            <View style={styles.emptyProvasContainer}>
              <Text style={styles.emptyProvasText}>
                Nenhuma prova com gabarito encontrada
              </Text>
              <TouchableOpacity
                style={styles.createProvaButton}
                onPress={() => router.push('/criar-editar-prova')}
              >
                <Text style={styles.createProvaButtonText}>Criar Prova</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.formLabel}>Nome do Aluno</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do aluno"
            placeholderTextColor="#999"
            value={nomeAluno}
            onChangeText={setNomeAluno}
          />

          <TouchableOpacity
            style={[
              styles.startButton, 
              (!selectedProvaId || !nomeAluno.trim()) && styles.startButtonDisabled
            ]}
            onPress={iniciarCaptura}
            disabled={!selectedProvaId || !nomeAluno.trim()}
          >
            <Feather name="camera" size={20} color="#FFF" />
            <Text style={styles.startButtonText}>Iniciar Captura</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderPreview = () => {
    if (!capturedImage) {
      return null;
    }

    return (
      <View style={styles.previewContainer}>
        {/* Mostra tanto a imagem original quanto a recortada */}
        <View style={styles.previewImages}>
          <View style={styles.previewImageContainer}>
            <Text style={styles.previewLabel}>Imagem Original</Text>
            <Image 
              source={{ uri: capturedImage }} 
              style={styles.previewImageSplit}
              resizeMode="contain"
            />
          </View>
          
          {croppedImage && (
            <View style={styles.previewImageContainer}>
              <Text style={styles.previewLabel}>Área Recortada</Text>
              <Image 
                source={{ uri: croppedImage }} 
                style={styles.previewImageSplit}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
        
        <View style={styles.previewActions}>
          <TouchableOpacity 
            style={[styles.previewButton, styles.cancelButton]}
            onPress={() => {
              setCapturedImage(null);
              setCroppedImage(null);
            }}
            disabled={isSaving}
          >
            <Feather name="refresh-ccw" size={20} color="#FF6B6B" />
            <Text style={styles.cancelText}>Capturar novamente</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.previewButton, styles.saveButton]}
            onPress={salvarImagem}
            disabled={isSaving || isProcessing}
          >
            {isSaving || isProcessing ? (
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
          flash={flashMode}
          responsiveOrientationWhenOrientationLocked
        >
          <View style={styles.overlayContainer}>
            {/* Moldura melhorada com proporção mais adequada para o gabarito */}
            <View style={[
              styles.frameGuide, 
              { 
                width: FRAME_WIDTH, 
                height: FRAME_HEIGHT 
              }
            ]}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
              
              {/* Linhas de grade para ajudar no alinhamento */}
              <View style={styles.gridLineHorizontal} />
              <View style={styles.gridLineVertical} />
            </View>
            <Text style={styles.guideText}>
              Alinhe o gabarito dentro da moldura
            </Text>
          </View>
          
          <View style={styles.shutterContainer}>
            <Pressable onPress={() => setShowCamera(false)}>
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
            
            <Pressable onPress={toggleFlash}>
              <Feather 
                name={flashMode === 'off' ? "zap-off" : "zap"} 
                size={32} 
                color="white" 
              />
            </Pressable>
          </View>
        </CameraView>
      </>
    );
  };

  if (!showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#2F4FCD" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Capturar Prova</Text>
          <View style={{ width: 24 }} />
        </View>
        {renderFormulario()}
      </SafeAreaView>
    );
  }

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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#2F4FCD',
  },
  formContainer: {
    padding: 20,
  },
  formHeader: {
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#2F4FCD',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  formCard: {
    backgroundColor: '#DDDBFF',
    borderRadius: 16,
    padding: 20,
    // Estilo neomorphism
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#2F4FCD',
    marginBottom: 8,
    marginTop: 16,
  },
  pickerWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#2F4FCD',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  emptyProvasContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyProvasText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  createProvaButton: {
    backgroundColor: '#2F4FCD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createProvaButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  startButton: {
    backgroundColor: '#2F4FCD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  startButtonDisabled: {
    backgroundColor: '#BBBADD',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginLeft: 8,
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
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    height: 25,
    width: 25,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#2F4FCD',
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    height: 25,
    width: 25,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#2F4FCD',
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    height: 25,
    width: 25,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#2F4FCD',
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    height: 25,
    width: 25,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#2F4FCD',
  },
  // Linhas de grade para ajudar no alinhamento
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    top: '50%',
  },
  gridLineVertical: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    left: '50%',
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
  previewImages: {
    flex: 1,
    flexDirection: 'column',
  },
  previewImageContainer: {
    flex: 1,
    margin: 5,
    backgroundColor: '#111',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewLabel: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
  },
  previewImageSplit: {
    flex: 1,
    width: '100%',
    height: '100%',
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