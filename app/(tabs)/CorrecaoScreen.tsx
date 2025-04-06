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

// Interface para tipagem das provas e imagens
interface ProvaImagem {
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

// Dados simulados para a listagem
const IMAGENS_MOCKUP: ProvaImagem[] = [
  {
    id: '1',
    provaId: '1',
    imageUri: 'https://via.placeholder.com/300x400',
    dataCriacao: '06/04/2025',
    status: 'corrigido',
    resultado: {
      acertos: 8,
      total: 10,
      nota: 8.0
    }
  },
  {
    id: '2',
    provaId: '2',
    imageUri: 'https://via.placeholder.com/300x400',
    dataCriacao: '06/04/2025',
    status: 'em_analise'
  },
  {
    id: '3',
    provaId: '1',
    imageUri: 'https://via.placeholder.com/300x400',
    dataCriacao: '05/04/2025',
    status: 'pendente'
  }
];

export default function CorrecaoScreen() {
  const [imagens, setImagens] = useState<ProvaImagem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // Simulando carregamento de dados da API
    const carregarDados = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setImagens(IMAGENS_MOCKUP);
      } catch (error) {
        console.error('Erro ao carregar imagens:', error);
        Alert.alert('Erro', 'Não foi possível carregar as imagens das provas.');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarDados();
  }, []);
  
  const iniciarCorrecao = (item: ProvaImagem) => {
    if (item.status === 'pendente') {
      // Simula envio para API
      const atualizaStatus = async () => {
        try {
          setImagens(imagens.map(img => 
            img.id === item.id ? { ...img, status: 'em_analise' } : img
          ));
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Após receber a resposta da API, atualiza para corrigido com resultado
          setImagens(imagens.map(img => 
            img.id === item.id ? {
              ...img,
              status: 'corrigido',
              resultado: {
                acertos: 7,
                total: 10,
                nota: 7.0
              }
            } : img
          ));
          
          // Navegaria para tela de detalhes da correção
          // router.push(`/detalhes-correcao/${item.id}`);
          
        } catch (error) {
          console.error('Erro ao processar correção:', error);
          Alert.alert('Erro', 'Não foi possível processar a correção.');
        }
      };
      
      atualizaStatus();
    } else if (item.status === 'corrigido') {
      // Navegaria para tela de detalhes da correção
      // router.push(`/detalhes-correcao/${item.id}`);
      Alert.alert('Detalhes', 'Abre a tela de detalhes da correção.');
    }
  };
  
  const renderStatusBadge = (status: ProvaImagem['status']) => {
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
            onPress={() => router.push('/criar-editar-prova')}
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