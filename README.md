# Bem-vindo ao GabiCam 👋

Este é um projeto [Expo](https://expo.dev) criado com [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

O GabiCam é um aplicativo React Native para capturar, corrigir e gerenciar provas através de reconhecimento óptico de caracteres (OCR).

## Começando

1. Instale as dependências
   ```bash
   npm install
   ```

2. Inicie o aplicativo
   ```bash
    npx expo start
   ```

Na saída, você encontrará opções para abrir o aplicativo em:
- [build de desenvolvimento](https://docs.expo.dev/develop/development-builds/introduction/)
- [emulador Android](https://docs.expo.dev/workflow/android-studio-emulator/)
- [simulador iOS](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), um sandbox limitado para experimentar o desenvolvimento de aplicativos com Expo

Você pode começar a desenvolver editando os arquivos dentro do diretório **app**. Este projeto usa [roteamento baseado em arquivos](https://docs.expo.dev/router/introduction).

## Funcionalidades

- Criar e gerenciar provas com gabaritos
- Capturar fotos de folhas de resposta usando a câmera
- Correção automática usando tecnologia OCR
- Visualizar resultados e estatísticas das correções

## Armazenamento de Dados

Este aplicativo usa **AsyncStorage** para persistência local de dados. Todos os dados das provas, gabaritos, imagens capturadas e resultados das correções são armazenados localmente no dispositivo usando as seguintes chaves de armazenamento:

- `@GabaritoApp:provas` - Armazena modelos de provas e gabaritos
- `@GabaritoApp:imagens` - Armazena imagens capturadas e resultados das correções

Utilitários de armazenamento estão disponíveis em `app/utils/storageUtils.ts` para operações de gerenciamento de dados.

## Configuração da API

O aplicativo se conecta a uma API de OCR para correção automática. Atualize a URL da API nos arquivos de tela relevantes:

```typescript
const API_URL = 'http://sua-url-api:5000/corrigir';
```

## Saiba mais

Para saber mais sobre o desenvolvimento do seu projeto com Expo, consulte os seguintes recursos:

- [Documentação do Expo](https://docs.expo.dev/): Aprenda os fundamentos ou mergulhe em tópicos avançados com nossos [guias](https://docs.expo.dev/guides).
- [Tutorial Learn Expo](https://docs.expo.dev/tutorial/introduction/): Siga um tutorial passo a passo onde você criará um projeto que roda no Android, iOS e na web.
