import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Prova {
  id: string;
  nome: string;
  dataCriacao: string;
  fotos: string[];
  gabarito?: string[];
}

const STORAGE_KEY = '@GabaritoApp:provas';

export default function CadastrarQuestoes() {
  const { provaId } = useLocalSearchParams();
  const router = useRouter();
  const [respostas, setRespostas] = useState(Array(10).fill('A'));
  const [nomeProva, setNomeProva] = useState('');
  const opcoes = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    carregarProva();
  }, []);

  const carregarProva = async () => {
    try {
      const provasArmazenadas = await AsyncStorage.getItem(STORAGE_KEY);
      if (provasArmazenadas) {
        const provas: Prova[] = JSON.parse(provasArmazenadas);
        const provaAtual = provas.find(p => p.id === provaId);
        
        if (provaAtual) {
          setNomeProva(provaAtual.nome);
          // Se já existe um gabarito, carrega as respostas
          if (provaAtual.gabarito) {
            setRespostas(provaAtual.gabarito);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar prova:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da prova');
    }
  };

  const atualizarResposta = (index: number, valor: string) => {
    const novasRespostas = [...respostas];
    novasRespostas[index] = valor;
    setRespostas(novasRespostas);
  };

  const salvarGabarito = async () => {
    if (!nomeProva.trim()) {
      Alert.alert('Erro', 'Digite o nome da prova.');
      return;
    }
  
    try {
      // Carrega as provas existentes
      const provasArmazenadas = await AsyncStorage.getItem(STORAGE_KEY);
      let provas: Prova[] = [];
      
      if (provasArmazenadas) {
        provas = JSON.parse(provasArmazenadas);
      }

      // Atualiza a prova específica com o gabarito
      const provasAtualizadas = provas.map(prova => {
        if (prova.id === provaId) {
          return {
            ...prova,
            nome: nomeProva,
            gabarito: respostas
          };
        }
        return prova;
      });

      // Salva as provas atualizadas
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(provasAtualizadas));
      
      Alert.alert(
        'Sucesso', 
        'Gabarito salvo com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar gabarito:', error);
      Alert.alert('Erro', 'Não foi possível salvar o gabarito');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nome da Prova:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Prova de Matemática"
        placeholderTextColor="#999"
        value={nomeProva}
        onChangeText={setNomeProva}
      />

      {respostas.map((resposta, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.label}>Questão {index + 1}</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={resposta}
              onValueChange={(itemValue) => atualizarResposta(index, itemValue)}
              style={styles.picker}
              dropdownIconColor="#6A0DAD"
            >
              {opcoes.map((opcao) => (
                <Picker.Item key={opcao} label={opcao} value={opcao} />
              ))}
            </Picker>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={salvarGabarito}>
        <Text style={styles.buttonText}>Salvar Gabarito</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0ff',
    padding: 20,
    alignItems: 'stretch',
  },
  label: {
    fontSize: 16,
    color: '#6A0DAD',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#e0e0f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: '#6A0DAD',
    shadowOffset: { width: -3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  card: {
    backgroundColor: '#e8e8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#b0aaff',
    shadowOffset: { width: -4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  pickerWrapper: {
    backgroundColor: '#dcdcff',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  picker: {
    height: 50,
    color: '#6A0DAD',
  },
  button: {
    backgroundColor: '#6A0DAD',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 20,
    shadowColor: '#6A0DAD',
    shadowOffset: { width: -3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});