// app/correcao.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

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
const API_URL = 'http://192.168.2.103:5000/corrigir';

export default function CorrecaoScreen() {
  const [imagens, setImagens] = useState<ImagemCapturada[]>([]);
  const [provas, setProvas] = useState<Prova[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Carregar provas
      const provasArmazenadas = await AsyncStorage.getItem(PROVAS_STORAGE_KEY);
      let provasData: Prova[] = [];
      if (provasArmazenadas) {
        provasData = JSON.parse(provasArmazenadas);
        setProvas(provasData);
      }

      // Carregar imagens
      const imagensArmazenadas = await AsyncStorage.getItem(IMAGENS_STORAGE_KEY);
      if (imagensArmazenadas) {
        setImagens(JSON.parse(imagensArmazenadas));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const salvarImagens = async (imagensAtualizadas: ImagemCapturada[]) => {
    try {
      await AsyncStorage.setItem(IMAGENS_STORAGE_KEY, JSON.stringify(imagensAtualizadas));
    } catch (error) {
      console.error('Erro ao salvar imagens:', error);
    }
  };

  const iniciarCorrecao = async (item: ImagemCapturada) => {
    if (item.status === 'pendente') {
      try {
        // Atualizar status para em_analise
        const imagensAtualizadas = imagens.map(img => 
          img.id === item.id ? { ...img, status: 'em_analise' as const } : img
        );
        setImagens(imagensAtualizadas);
        await salvarImagens(imagensAtualizadas);

        // Encontrar a prova associada
        const prova = provas.find(p => p.id === item.provaId);
        if (!prova || !prova.gabarito) {
          Alert.alert('Erro', 'Prova ou gabarito não encontrado.');
          
          // Reverter status para pendente
          const imagensRevertidas = imagens.map(img => 
            img.id === item.id ? { ...img, status: 'pendente' as const } : img
          );
          setImagens(imagensRevertidas);
          await salvarImagens(imagensRevertidas);
          return;
        }

        // Preparar dados para API
        const formData = new FormData();
        
        // Extrair nome do arquivo da URI
        const fileNameFromUri = item.imageUri.split('/').pop();
        
        // Adicionar imagem ao FormData
        formData.append('imagem', {
          uri: item.imageUri,
          type: 'image/jpeg',
          name: fileNameFromUri || `prova_${item.id}.jpg`
        } as any);
        
        // Adicionar gabarito como uma string única
        formData.append('gabarito', prova.gabarito.join(''));

        console.log('Enviando para API:', {
          uri: item.imageUri,
          gabarito: prova.gabarito.join('')
        });

        // Enviar para API de correção
        const response = await fetch(API_URL, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            // Remover 'Content-Type' quando usando FormData
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro na resposta da API: ${response.status} - ${errorText}`);
        }

        const resultado = await response.json();
        console.log('Resultado da API:', resultado);

        // Atualizar status para corrigido com resultado
        const imagensFinais = imagens.map(img => 
          img.id === item.id ? {
            ...img,
            status: 'corrigido' as const,
            resultado: {
              acertos: resultado.acertos,
              total: resultado.total_questoes,
              nota: (resultado.acertos / resultado.total_questoes) * 10
            }
          } : img
        );
        
        setImagens(imagensFinais);
        await salvarImagens(imagensFinais);
        
        Alert.alert(
          'Correção Concluída',
          `Aluno: ${item.nomeAluno}\nNota: ${((resultado.acertos / resultado.total_questoes) * 10).toFixed(1)}\nAcertos: ${resultado.acertos}/${resultado.total_questoes}`
        );
        
      } catch (error) {
        console.error('Erro ao processar correção:', error);
        // Reverter para status pendente em caso de erro
        const imagensAtualizadas = imagens.map(img => 
          img.id === item.id ? { ...img, status: 'pendente' as const } : img
        );
        setImagens(imagensAtualizadas);
        await salvarImagens(imagensAtualizadas);
        Alert.alert('Erro', `Não foi possível processar a correção: ${error.message}`);
      }
    } else if (item.status === 'corrigido') {
      // Mostrar detalhes da correção
      Alert.alert(
        'Detalhes da Correção',
        `Aluno: ${item.nomeAluno}\nProva: ${item.nomeProva}\nNota: ${item.resultado?.nota.toFixed(1)}\nAcertos: ${item.resultado?.acertos}/${item.resultado?.total}`
      );
    } else if (item.status === 'em_analise') {
      Alert.alert(
        'Processando',
        'Esta prova já está sendo processada. Aguarde a conclusão.'
      );
    }
  };
  
  const renderStatusBadge = (status: ImagemCapturada['status']) => {
    let backgroundColor, textColor, label;
    
    switch (status) {
      case 'pendente':
        backgroundColor = '#DDDBFF';
        textColor = '#2F4FCD';
        label = 'Pendente';
        break;
      case 'em_analise':
        backgroundColor = '#FFE4B2';
        textColor = '#F5A623';
        label = 'Em análise';
        break;
      case 'corrigido':
        backgroundColor = '#D5F5E3';
        textColor = '#27AE60';
        label = 'Corrigido';
        break;
    }
    
    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <Text style={[styles.statusText, { color: textColor }]}>{label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Correção de Provas</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F4FCD" />
          <Text style={styles.loadingText}>Carregando imagens...</Text>
        </View>
      ) : imagens.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Feather name="camera-off" size={60} color="#2F4FCD" />
          </View>
          <Text style={styles.emptyText}>Nenhuma imagem capturada</Text>
          <Text style={styles.emptySubText}>
            Capture imagens das provas para iniciar a correção
          </Text>
          <TouchableOpacity 
            style={styles.capturarButton}
            onPress={() => router.push('/CriarEditarProvaScreen')}
          >
            <Text style={styles.capturarButtonText}>Ir para minhas provas</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={imagens}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.imagemCard}
              onPress={() => iniciarCorrecao(item)}
              disabled={item.status === 'em_analise'}
            >
              <View style={styles.cardContent}>
                <Image 
                  source={{ uri: item.imageUri }}
                  style={styles.thumbnail}
                />
                
                <View style={styles.imagemInfo}>
                  <Text style={styles.alunoNome}>{item.nomeAluno}</Text>
                  <Text style={styles.provaNome}>Prova: {item.nomeProva}</Text>
                  <Text style={styles.imagemData}>
                    Capturada em: {item.dataCriacao}
                  </Text>
                  
                  {renderStatusBadge(item.status)}
                  
                  {item.status === 'corrigido' && item.resultado && (
                    <View style={styles.resultadoContainer}>
                      <Text style={styles.resultadoText}>
                        Nota: <Text style={styles.notaText}>{item.resultado.nota.toFixed(1)}</Text>
                      </Text>
                      <Text style={styles.acertosText}>
                        {item.resultado.acertos}/{item.resultado.total} acertos
                      </Text>
                    </View>
                  )}
                  
                  {item.status === 'em_analise' && (
                    <View style={styles.analisandoContainer}>
                      <ActivityIndicator size="small" color="#F5A623" />
                      <Text style={styles.analisandoText}>Processando...</Text>
                    </View>
                  )}
                  
                  {item.status === 'pendente' && (
                    <Text style={styles.pendingText}>
                      Toque para iniciar a correção
                    </Text>
                  )}
                </View>
              </View>
              
              <Feather 
                name={item.status === 'corrigido' ? 'eye' : 'chevron-right'} 
                size={24} 
                color="#2F4FCD" 
                style={styles.cardIcon}
              />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#2F4FCD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DDDBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    // Estilo neomorphism
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#2F4FCD',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  capturarButton: {
    backgroundColor: '#2F4FCD',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    // Estilo neomorphism
    shadowColor: 'rgba(47, 79, 205, 0.5)',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  capturarButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  listContainer: {
    padding: 15,
  },
  imagemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDDBFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    // Estilo neomorphism
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#BBBADD',
  },
  imagemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  alunoNome: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#2F4FCD',
    marginBottom: 2,
  },
  provaNome: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    marginBottom: 2,
  },
  imagemData: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  resultadoContainer: {
    marginTop: 3,
  },
  resultadoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  notaText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#27AE60',
  },
  acertosText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  analisandoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  analisandoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#F5A623',
    marginLeft: 8,
  },
  pendingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#2F4FCD',
    marginTop: 5,
  },
  cardIcon: {
    marginLeft: 10,
  }
});