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
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

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
// Diretório para salvar as imagens normalizadas
const NORMALIZED_IMAGES_DIR = `${FileSystem.cacheDirectory}normalized_images/`;

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
  const [imageSource, setImageSource] = useState<'camera' | 'gallery' | null>(null);
  
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  // Dimensões para o quadro de recorte - ajustado para proporção da folha A4 com o gabarito
  const FRAME_WIDTH = SCREEN_WIDTH * 0.85;
  const FRAME_HEIGHT = FRAME_WIDTH * 1.2; // Proporção aproximada do gabarito na imagem de exemplo

  useEffect(() => {
    carregarProvas();
    
    // Criar diretório para imagens normalizadas se não existir
    const setupDirectory = async () => {
      try {
        const dirInfo = await FileSystem.getInfoAsync(NORMALIZED_IMAGES_DIR);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(NORMALIZED_IMAGES_DIR, { intermediates: true });
          console.log("Diretório de imagens normalizadas criado");
        }
      } catch (err) {
        console.error("Erro ao criar diretório:", err);
      }
    };
    
    setupDirectory();
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
  
  // Função para selecionar imagem da galeria
// Função para selecionar imagem da galeria
// Função para selecionar imagem da galeria
const selecionarDaGaleria = async () => {
  if (!selectedProvaId) {
    Alert.alert('Erro', 'Selecione uma prova/gabarito');
    return;
  }
  if (!nomeAluno.trim()) {
    Alert.alert('Erro', 'Digite o nome do aluno');
    return;
  }

  try {
    // Solicitar permissão para acessar a galeria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de permissão para acessar sua galeria de fotos');
      return;
    }
    
    // Lançar ImagePicker para selecionar da galeria
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      aspect: [4, 5], // Proporção aproximada de um gabarito
    });
    
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      
      setIsProcessing(true);
      setImageSource('gallery');
      setCapturedImage(uri);
      
      try {
        // Apenas converter para JPG com nome padronizado
        const processedImage = await normalizeImage(uri);
        console.log("Imagem normalizada para JPG:", processedImage);
        setCroppedImage(processedImage);
      } catch (processError) {
        console.error("Erro ao normalizar imagem:", processError);
        setCroppedImage(uri);
        Alert.alert('Erro', 'Não foi possível normalizar a imagem.');
      } finally {
        setIsProcessing(false);
      }
    }
  } catch (error) {
    console.error('Erro ao selecionar imagem da galeria:', error);
    Alert.alert('Erro', 'Não foi possível selecionar a imagem da galeria.');
    setIsProcessing(false);
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

  // Função para normalizar a imagem para um formato padronizado
  // Função simplificada para normalizar a imagem para JPG e padronizar o nome
const normalizeImage = async (imageUri: string): Promise<string> => {
  try {
    // Criar um nome padronizado para o arquivo
    const normalizedFilename = `PROVA-OCR.jpg`;
    const normalizedFilePath = `${NORMALIZED_IMAGES_DIR}${normalizedFilename}`;
    
    // Converter para JPG com qualidade 100% sem qualquer outro processamento
    const convertedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [], // Sem operações de transformação
      { compress: 1.0, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    console.log("Imagem convertida para JPG:", convertedImage.uri);
    
    // Salvar com nome padronizado
    await FileSystem.moveAsync({
      from: convertedImage.uri,
      to: normalizedFilePath
    });
    
    return normalizedFilePath;
  } catch (error) {
    console.error("Erro ao normalizar imagem:", error);
    // Em caso de erro, retorna a imagem original
    return imageUri;
  }
};

  // Função para recortar apenas a área do gabarito
  const cropGabaritoArea = async (imageUri: string) => {
    try {
      setIsProcessing(true);
      
      // Primeiro normalize a imagem
      const normalizedUri = await normalizeImage(imageUri);
      console.log('Imagem normalizada para processamento:', normalizedUri);
      
      // Obtém as dimensões da imagem
      const { width: photoWidth, height: photoHeight } = await new Promise((resolve) => {
        Image.getSize(normalizedUri, (width, height) => {
          resolve({ width, height });
        });
      });
      
      // Calcula as coordenadas para o recorte centralizado na imagem
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
        normalizedUri,
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
      
      // Aprimoramentos adicionais para melhorar a qualidade
      const enhancedResult = await ImageManipulator.manipulateAsync(
        manipResult.uri,
        [],  // Sem operações adicionais
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      console.log('Imagem recortada e melhorada:', enhancedResult.uri);
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
        setImageSource('camera');
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

      // Normalizar a imagem final antes de salvar (caso ainda não tenha sido normalizada)
      let finalImage = capturedImage;
      if (!finalImage.includes(NORMALIZED_IMAGES_DIR)) {
        finalImage = await normalizeImage(capturedImage);
      }

      // Criar objeto da imagem capturada
      const novaImagem: ImagemCapturada = {
        id: Date.now().toString(),
        provaId: selectedProvaId,
        nomeAluno: nomeAluno.trim(),
        nomeProva: provaSelecionada.nome,
        imageUri: finalImage, // Usa a imagem normalizada
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
                onPress={() => router.push('/CriarEditarProvaScreen')}
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

          <View style={styles.captureOptions}>
            <TouchableOpacity
              style={[
                styles.captureButton, 
                (!selectedProvaId || !nomeAluno.trim()) && styles.captureButtonDisabled
              ]}
              onPress={iniciarCaptura}
              disabled={!selectedProvaId || !nomeAluno.trim()}
            >
              <Feather name="camera" size={20} color="#FFF" />
              <Text style={styles.captureButtonText}>Usar Câmera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.captureButton, 
                styles.galleryButton,
                (!selectedProvaId || !nomeAluno.trim()) && styles.captureButtonDisabled
              ]}
              onPress={selecionarDaGaleria}
              disabled={!selectedProvaId || !nomeAluno.trim()}
            >
              <Feather name="image" size={20} color="#FFF" />
              <Text style={styles.captureButtonText}>Selecionar da Galeria</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

// Modificação no renderPreview para imagens da galeria
const renderPreview = () => {
  if (!capturedImage) {
    return null;
  }

  return (
    <View style={styles.previewContainer}>
      {/* Para imagens da câmera, mostra original e recortada; para galeria, mostra apenas a normalizada */}
      <View style={styles.previewImages}>
        {imageSource === 'camera' ? (
          // Exibição para imagens da câmera (imagem original + recortada)
          <>
            <View style={styles.previewImageContainer}>
              <Text style={styles.previewLabel}>Imagem Capturada</Text>
              <Image 
                source={{ uri: capturedImage }} 
                style={styles.previewImageSplit}
                resizeMode="contain"
              />
            </View>
            
            {croppedImage ? (
              <View style={styles.previewImageContainer}>
                <Text style={styles.previewLabel}>Área Processada</Text>
                <Image 
                  source={{ uri: croppedImage }} 
                  style={styles.previewImageSplit}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={styles.previewImageContainer}>
                <Text style={styles.previewLabel}>Processando...</Text>
                <ActivityIndicator size="large" color="#2F4FCD" />
              </View>
            )}
          </>
        ) : (
          // Exibição para imagens da galeria (apenas a imagem normalizada)
          <View style={[styles.previewImageContainer, {flex: 1}]}>
            <Text style={styles.previewLabel}>Imagem Selecionada</Text>
            <Image 
              source={{ uri: croppedImage || capturedImage }} 
              style={styles.previewImage}
              resizeMode="contain"
            />
            {!croppedImage && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#2F4FCD" />
                <Text style={styles.processingText}>Processando imagem...</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.previewActions}>
        <TouchableOpacity 
          style={[styles.previewButton, styles.cancelButton]}
          onPress={() => {
            setCapturedImage(null);
            setCroppedImage(null);
            setImageSource(null);
            
            // Se veio da galeria, volta para o formulário, se veio da câmera, volta para a câmera
            if (imageSource === 'gallery') {
              setShowCamera(false);
            }
          }}
          disabled={isSaving || isProcessing}
        >
          <Feather name="refresh-ccw" size={20} color="#FF6B6B" />
          <Text style={styles.cancelText}>
            {imageSource === 'camera' ? 'Capturar novamente' : 'Selecionar outra'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.previewButton, 
            styles.saveButton,
            (isSaving || isProcessing || !croppedImage) && styles.saveButtonDisabled
          ]}
          onPress={salvarImagem}
          disabled={isSaving || isProcessing || !croppedImage}
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
          <View style={styles.cameraHeader}>
            <TouchableOpacity onPress={() => setShowCamera(false)}>
              <Feather name="arrow-left" size={28} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={toggleFacing}>
              <Feather name="refresh-cw" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={toggleFlash}>
              <Feather 
                name={flashMode === 'off' ? "zap-off" : "zap"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          </View>

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
            <TouchableOpacity 
              style={styles.galleryOption}
              onPress={selecionarDaGaleria}
            >
              <Feather name="image" size={28} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shutterBtn}
              onPress={captureImage}
            >
              <View style={styles.shutterBtnInner} />
            </TouchableOpacity>
            
            <View style={{ width: 40 }} /> {/* Espaço para balancear o layout */}
          </View>
        </CameraView>
      </>
    );
  };

  if (!showCamera && !capturedImage) {
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

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        {renderPreview()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {renderCamera()}
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
  captureOptions: {
    marginTop: 20,
  },
  captureButton: {
    backgroundColor: '#2F4FCD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  galleryButton: {
    backgroundColor: '#27AE60',
  },
  captureButtonDisabled: {
    backgroundColor: '#BBBADD',
  },
  captureButtonText: {
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
 cameraHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   width: '100%',
   paddingHorizontal: 20,
   paddingTop: Platform.OS === 'ios' ? 50 : 30,
   paddingBottom: 20,
   position: 'absolute',
   top: 0,
   left: 0,
   zIndex: 10,
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
   justifyContent: 'space-around',
   paddingHorizontal: 30,
 },
 galleryOption: {
   width: 40,
   height: 40,
   borderRadius: 20,
   backgroundColor: 'rgba(47, 79, 205, 0.7)',
   justifyContent: 'center',
   alignItems: 'center',
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
 saveButtonDisabled: {
   backgroundColor: 'rgba(47, 79, 205, 0.5)',
 },
 saveText: {
   color: '#FFFFFF',
   fontSize: 14,
   fontFamily: 'Poppins-Medium',
   marginLeft: 5,
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
 processingOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
processingText: {
  color: '#FFF',
  fontSize: 16,
  fontFamily: 'Poppins-Medium',
  marginTop: 10,
},
});