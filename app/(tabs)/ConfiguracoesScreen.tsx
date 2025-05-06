// app/configuracoes.tsx
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { 
  limparTodoArmazenamento, 
  limparProvas, 
  limparImagens, 
  debugStorage 
} from '../utils/storageUtils';

export default function ConfiguracoesScreen() {
  const router = useRouter();

  const confirmarLimpezaTotal = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir TODOS os dados do aplicativo? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir Tudo',
          style: 'destructive',
          onPress: async () => {
            const sucesso = await limparTodoArmazenamento();
            if (sucesso) {
              router.push('/'); // Volta para a tela inicial
            }
          },
        },
      ]
    );
  };

  const confirmarLimpezaProvas = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir todas as provas?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir Provas',
          style: 'destructive',
          onPress: async () => {
            const sucesso = await limparProvas();
            if (sucesso) {
              Alert.alert('Sucesso', 'Todas as provas foram removidas.');
            }
          },
        },
      ]
    );
  };

  const confirmarLimpezaImagens = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir todas as imagens capturadas?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir Imagens',
          style: 'destructive',
          onPress: async () => {
            const sucesso = await limparImagens();
            if (sucesso) {
              Alert.alert('Sucesso', 'Todas as imagens foram removidas.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#2F4FCD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gerenciamento de Dados</Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={confirmarLimpezaProvas}
          >
            <Feather name="file-text" size={24} color="#2F4FCD" />
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Limpar Provas</Text>
              <Text style={styles.buttonSubtitle}>Remove todas as provas criadas</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={confirmarLimpezaImagens}
          >
            <Feather name="image" size={24} color="#2F4FCD" />
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Limpar Imagens</Text>
              <Text style={styles.buttonSubtitle}>Remove todas as imagens capturadas</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]}
            onPress={confirmarLimpezaTotal}
          >
            <Feather name="trash-2" size={24} color="#FF6B6B" />
            <View style={styles.buttonTextContainer}>
              <Text style={[styles.buttonTitle, styles.dangerText]}>Limpar Todos os Dados</Text>
              <Text style={[styles.buttonSubtitle, styles.dangerText]}>Remove todos os dados do aplicativo</Text>
            </View>
          </TouchableOpacity>
        </View>

        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Desenvolvimento</Text>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={debugStorage}
            >
              <Feather name="terminal" size={24} color="#2F4FCD" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Debug Storage</Text>
                <Text style={styles.buttonSubtitle}>Ver dados armazenados no console</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#2F4FCD',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#2F4FCD',
    marginBottom: 15,
  },
  button: {
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
  dangerButton: {
    backgroundColor: '#FFE0E0',
  },
  buttonTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#2F4FCD',
  },
  buttonSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  dangerText: {
    color: '#FF6B6B',
  },
});