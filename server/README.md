# Servidor GabiCam

Este é o servidor backend para o aplicativo GabiCam.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure o banco de dados MySQL:
- Crie um banco de dados chamado `gabicam_db`
- Execute o seguinte SQL para criar as tabelas:

```sql
CREATE DATABASE IF NOT EXISTS gabicam_db;
USE gabicam_db;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS provas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gabarito JSON,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS imagens_provas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prova_id INT NOT NULL,
    usuario_id INT NOT NULL,
    nome_aluno VARCHAR(100) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'em_analise', 'corrigido') DEFAULT 'pendente',
    acertos INT DEFAULT 0,
    total_questoes INT DEFAULT 0,
    nota DECIMAL(4,2) DEFAULT 0.00,
    FOREIGN KEY (prova_id) REFERENCES provas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
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

### Provas

#### Salvar Resultados
- POST `/api/provas/salvar-resultados`
- Body: `{ "provaId": "string", "resultados": [{ "nomeAluno": "string", "acertos": number, "total": number, "nota": number }] }`

### Teste
- GET `/test`
- Retorna uma mensagem confirmando que a API está funcionando 