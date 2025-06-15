# Servidor GabiCam

Este é o servidor backend para o aplicativo GabiCam.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure o banco de dados MySQL:
- Crie um banco de dados chamado `gabicam_db`
- Execute o seguinte SQL para criar a tabela de usuários:

```sql
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matricula VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do projeto
- Adicione as seguintes variáveis:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gabicam_db
PORT=5000
```

## Executando o servidor

Para desenvolvimento:
```bash
npm run dev
```

Para produção:
```bash
npm start
```

## Rotas da API

### Autenticação

#### Login
- POST `/api/login`
- Body: `{ "matricula": "string", "senha": "string" }`

#### Cadastro
- POST `/api/cadastro`
- Body: `{ "matricula": "string", "nome": "string", "senha": "string" }`

### Teste
- GET `/test`
- Retorna uma mensagem confirmando que a API está funcionando 