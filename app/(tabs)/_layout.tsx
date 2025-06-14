import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2F4FCD',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="CorrecaoScreen"
        options={{
          title: 'Correção',
          tabBarIcon: ({ color, size }) => (
            <Feather name="check-square" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="CameraProvaScreen"
        options={{
          title: 'Capturar',
          tabBarIcon: ({ color, size }) => (
            <Feather name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ConfiguracoesScreen"
        options={{
          title: 'Config',
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="CriarEditarProvaScreen"
        options={{
          href: null, // Oculta da barra de navegação
        }}
      />
      <Tabs.Screen
        name="CadastrarQuestoes"
        options={{
          href: null, // Oculta da barra de navegação
        }}
      />
      <Tabs.Screen
        name="Login"
        options={{
          href: null, // Oculta da barra de navegação
        }}
      />
      <Tabs.Screen
        name="Loginn"
        options={{
          href: null, // Oculta da barra de navegação
        }}
      />
      <Tabs.Screen
        name="ScanScreen"
        options={{
          href: null, // Oculta da barra de navegação
        }}
      />
      <Tabs.Screen
        name="TesteScreen"
        options={{
          href: null, // Oculta da barra de navegação
        }}
      />
    </Tabs>
  );
} 