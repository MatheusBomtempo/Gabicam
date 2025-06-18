# Bem-vindo ao GabiCam 👋

Este é um projeto [Expo](https://expo.dev) criado com [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

O **GabiCam** é um aplicativo React Native para capturar, corrigir e gerenciar provas escolares de forma automatizada, utilizando reconhecimento óptico de marcação (OCR).

---

## Novidades e Características

- **Login fictício**: Não é necessário autenticação real. Ideal para testes, demonstrações e uso offline.
- **Header padronizado**: Todas as telas possuem um cabeçalho unificado, com botão de voltar e título centralizado, garantindo navegação intuitiva.
- **Thumbnails persistentes**: As miniaturas das provas são salvas e exibidas corretamente mesmo após fechar e reabrir o app.
- **Gerenciamento local**: Todo o armazenamento de provas, imagens e resultados é feito localmente usando AsyncStorage e FileSystem, sem dependência de nuvem.
- **Sem Firebase**: O app é totalmente independente de serviços externos, tornando-o mais leve e fácil de manter.
- **Fluxo completo de correção**: Crie provas, cadastre gabaritos, capture fotos, corrija automaticamente e visualize resultados, tudo em poucos toques.
- **Configurações avançadas**: Limpe provas, imagens ou todos os dados do app facilmente pela tela de configurações.
- **Interface moderna**: Ícones, cores e fontes padronizadas para uma experiência agradável.

---

## Fluxo do Usuário

1. **Login**
   - Acesso rápido com login (apenas um clique para entrar).

2. **Tela Inicial**
   - Quatro botões principais: Criar Prova, Tirar Foto, Corrigir Provas, Configurações.

3. **Criar Prova**
   - Informe o nome da prova e crie um novo gabarito.
   - Cadastre as respostas corretas (A, B, C, D, E) para cada questão.

4. **Capturar Foto**
   - Selecione a prova e o nome do aluno.
   - Use a câmera ou galeria para capturar a folha de respostas.
   - As imagens são salvas localmente e associadas à prova.

5. **Corrigir Provas**
   - Veja todas as provas e suas imagens associadas.
   - Inicie a correção automática (OCR) e visualize nota, acertos e detalhes.
   - Salve os resultados e veja o histórico de correções.
   - Salvar os resultados para que seja persistido na nuvem e futuramente tratado em excel e interfaces visuais.

6. **Configurações**
   - Limpe provas, imagens ou todos os dados do app.
   - Acesse funções de teste e depuração.

---

## Exemplos Visuais (Fluxo)

```
[Login fictício]
   ↓
[Tela Inicial]
 ┌─────────────┬─────────────┐
 │ Criar Prova │ Tirar Foto  │
 ├─────────────┼─────────────┤
 │ Corrigir    │ Configurações│
 │ Provas      │             │
 └─────────────┴─────────────┘
   ↓
[Fluxo de Prova]
   - Criar Prova → Cadastrar Gabarito → Capturar Foto → Corrigir → Visualizar Resultados
```

---

## Funcionalidades Detalhadas

- **Criação de Provas**: Crie quantas provas quiser, cada uma com seu próprio gabarito.
- **Cadastro de Gabarito**: Defina as respostas corretas de cada questão de forma simples e visual.
- **Captura de Imagens**: Use a câmera do dispositivo ou selecione imagens da galeria. As imagens são salvas de forma persistente.
- **Correção Automática**: O app envia a imagem para uma API de OCR, que retorna os acertos, nota e detalhes da correção.
- **Visualização de Resultados**: Veja o histórico de correções, notas e estatísticas de cada prova/aluno.
- **Gerenciamento de Dados**: Limpe provas, imagens ou todos os dados do app facilmente.
- **Thumbnails Persistentes**: As miniaturas das provas são exibidas mesmo após fechar e reabrir o app.
- **Header Padronizado**: Navegação consistente em todas as telas.

---

## Armazenamento de Dados

- **AsyncStorage**: Armazena informações de provas, gabaritos e resultados.
- **FileSystem**: Armazena imagens capturadas de forma persistente.
- **Chaves de armazenamento:**
  - `@GabaritoApp:provas` - Provas, gabaritos e caminhos das imagens
  - `@GabaritoApp:imagens` - Imagens capturadas e resultados das correções
- Utilitários em `app/utils/storageUtils.ts` para facilitar operações de leitura, escrita e limpeza.

---

## Configuração da API de Correção

O aplicativo se conecta a uma API de OCR para correção automática. Atualize a URL da API nos arquivos de tela relevantes:

```typescript
const API_URL = 'http://sua-url-api:5000/corrigir';
```

A API deve receber uma imagem e um gabarito, e retornar os acertos, nota e respostas detectadas.

---

## FAQ

**1. Preciso de internet para usar o app?**
- Apenas para a etapa de correção automática (OCR). As demais funções funcionam offline.

**2. As imagens das provas somem quando fecho o app?**
- Não! As imagens são salvas de forma persistente no dispositivo.

**3. Posso usar em mais de um dispositivo?**
- Os dados são locais. Para sincronização entre dispositivos, seria necessário implementar uma API própria.

**4. O app usa Firebase?**
- Não. Toda a lógica de autenticação e armazenamento é local.

**5. Como limpar todos os dados?**
- Use a tela de configurações para limpar provas, imagens ou todos os dados do app.

---

