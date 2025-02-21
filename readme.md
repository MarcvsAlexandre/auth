

# Documentação do Projeto de Autenticação

## Sumário

1. [Visão Geral](#visão-geral)  
2. [Estrutura do Projeto](#estrutura-do-projeto)  
3. [Requisitos e Pré-requisitos](#requisitos-e-pré-requisitos)  
4. [Instalação e Execução (Local)](#instalação-e-execução-local)  
5. [Execução com Docker](#execução-com-docker)  
6. [Variáveis de Ambiente](#variáveis-de-ambiente)  
7. [Descrição dos Arquivos Principais](#descrição-dos-arquivos-principais)  
8. [Endpoints](#endpoints)  
9. [Considerações Finais](#considerações-finais)  

---

## Visão Geral
Este projeto é um serviço de autenticação de usuários utilizando **Node.js**, **Express**, **Prisma ORM** e **JWT**. Ele permite:
- **Registro de usuários** (`register`)
- **Login** com token JWT (`login`)
- **Alteração de senha** (`update-password`)

O banco de dados utilizado é **PostgreSQL**. A aplicação está preparada para ser executada localmente ou em contêineres via **Docker**.

---

## Estrutura do Projeto

```
📁 src/
 ├── 📁 config/
 │   ├── database.js       # Configuração do Prisma (conexão DB)
 │   ├── env.js            # (Opcional) Para gerenciar env no projeto
 ├── 📁 controllers/
 │   ├── auth.controller.js
 ├── 📁 middlewares/
 │   ├── auth.middleware.js
 │   ├── errorHandler.js
 ├── 📁 routes/
 │   ├── auth.routes.js
 ├── 📁 services/
 │   ├── auth.service.js
 ├── 📁 utils/
 │   ├── jwt.js
 │   ├── logger.js
 ├── index.js
📄 .env
📄 package.json
📄 prisma/
 └── schema.prisma         # Definição do modelo de dados
📄 Dockerfile
📄 docker-compose.yml
```

---

## Requisitos e Pré-requisitos

- **Node.js** >= 18
- **npm** (ou Yarn)
- **Docker** e **Docker Compose** (caso deseje usar contêineres)
- **PostgreSQL** instalado localmente (se for rodar sem Docker) ou configurado em outro ambiente

---

## Instalação e Execução (Local)

1. **Clonar o repositório**:
   ```bash
   git clone <repo-url>
   cd <repo-folder>
   ```

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente** em `.env` (exemplo):
   ```bash
   PORT=3001
   DATABASE_URL="postgresql://user:password@localhost:5432/authdb"
   JWT_SECRET="supersecret"
   MASTER_PASSWORD=false
   ```

4. **(Opcional)** Executar migrações do Prisma para criar o schema no banco:
   ```bash
   npx prisma migrate dev
   ```
   > Caso já tenha as tabelas criadas, verifique se o schema está alinhado.

5. **Iniciar a aplicação**:
   ```bash
   npm run dev
   ```
   A aplicação ficará acessível em [`http://localhost:3001`](http://localhost:3001) (ou na porta definida em `PORT`).

---

## Execução com Docker

1. **Verifique** se o arquivo `.env` possui as variáveis adequadas (principalmente `DATABASE_URL`, `JWT_SECRET`, etc.).

2. **Suba os contêineres**:
   ```bash
   docker-compose up --build
   ```
   Isso irá:
   - Criar um contêiner **PostgreSQL** (porta 5432).
   - Criar um contêiner **Node.js** para o serviço de autenticação (porta 3001 mapeada para a 3000 interna).

3. **Acesse** a aplicação em [`http://localhost:3001`](http://localhost:3001).  
   > Observação: Se o `PORT` no `.env` for 3000, o mapeamento do `docker-compose.yml` (`3001:3000`) fará com que ela rode em `localhost:3001`.

4. **Migrations**: Se precisar rodar migrations manualmente, acesse o contêiner do Node:
   ```bash
   docker-compose exec auth-service sh
   npx prisma migrate dev
   ```
   ou crie um script no `docker-compose.yml` que rode automaticamente antes de iniciar o servidor.

---

## Variáveis de Ambiente

| Variável         | Descrição                                                           | Exemplo                                           |
|------------------|---------------------------------------------------------------------|---------------------------------------------------|
| `PORT`           | Porta na qual o servidor Express será executado                     | `3001`                                            |
| `DATABASE_URL`   | String de conexão PostgreSQL                                        | `postgresql://user:password@localhost:5432/authdb`|
| `JWT_SECRET`     | Segredo para assinar/verificar tokens JWT                           | `supersecret`                                     |
| `MASTER_PASSWORD`| Senha “mestra” para login sem precisar da senha real (cuidado!)     | `false` ou `algum-segredo`                        |
| `NODE_ENV`       | Ambiente de execução (development, production, etc.)                | `development` ou `production`                     |

---

## Descrição dos Arquivos Principais

### 1. `config/database.js`
- Cria e exporta a instância do **PrismaClient** para interação com o banco.

### 2. `controllers/auth.controller.js`
- **register**: Recebe dados do usuário (nome, email, senha), chama o serviço e retorna um token JWT.
- **login**: Recebe credenciais (email, senha), chama o serviço e retorna um token JWT.
- **updatePassword**: Altera a senha do usuário, exigindo token de autenticação via middleware.

### 3. `middlewares/auth.middleware.js`
- Verifica se o cabeçalho `Authorization` contém o token JWT (`Bearer <token>`).
- Decodifica e injeta as informações do usuário em `req.user`.

### 4. `middlewares/errorHandler.js`
- Middleware para tratamento global de erros.
- Inclui a classe `AppError`, que permite criar erros com `statusCode` personalizados.
- Loga os erros via Winston (`logger`) e retorna uma resposta JSON padronizada.

### 5. `routes/auth.routes.js`
- Define as rotas relacionadas à autenticação:
  - `POST /auth/register`
  - `POST /auth/login`
  - `PUT /auth/update-password` (protegia por `authMiddleware`)

### 6. `services/auth.service.js`
- **registerUser**: Criptografa a senha e cria o registro no banco via Prisma, retornando o token JWT.
- **loginUser**: Verifica se o usuário existe, compara a senha (ou `MASTER_PASSWORD`) e retorna um token JWT.
- **changePassword**: Verifica a senha antiga, criptografa a nova e atualiza no banco de dados.

### 7. `utils/jwt.js`
- **generateToken**: Gera um token JWT com as informações do usuário (id, email) e expira em `1h` (por padrão).

### 8. `utils/logger.js`
- Configuração do **Winston** para logs em console e em arquivo (`logs/auth.log`).

### 9. `index.js`
- Ponto de entrada principal da aplicação.
- Configura **dotenv**, middlewares globais (`express.json`, `cors`, `helmet`, `morgan`) e registra as rotas (`authRoutes`).
- Inicia o servidor na porta definida em `PORT`.

### 10. `Dockerfile` e `docker-compose.yml`
- **Dockerfile**: Usa a imagem `node:18-alpine`, copia o código, instala dependências e expõe a porta 3000.  
- **docker-compose.yml**: Orquestra o serviço de banco de dados (PostgreSQL) e o serviço Node.js. Mapeia portas, define variáveis de ambiente e volumes.

---

## Endpoints

### `POST /auth/register`
- **Descrição**: Cria um novo usuário e retorna o token JWT.
- **Body**:
  ```json
  {
    "name": "Seu Nome",
    "email": "seuemail@example.com",
    "password": "senha123"
  }
  ```
- **Retorno**:
  ```json
  {
    "token": "jwt-gerado"
  }
  ```
- **Códigos de Status**:
  - `201 Created` em caso de sucesso  
  - `400 Bad Request` se houver erro (ex.: email duplicado, parâmetros faltando, etc.)

---

### `POST /auth/login`
- **Descrição**: Faz login e retorna um token JWT.
- **Body**:
  ```json
  {
    "email": "seuemail@example.com",
    "password": "senha123"
  }
  ```
- **Retorno**:
  ```json
  {
    "token": "jwt-gerado"
  }
  ```
- **Códigos de Status**:
  - `200 OK` em caso de sucesso  
  - `401 Unauthorized` se a senha estiver incorreta  
  - `404 Not Found` se o usuário não existir

---

### `PUT /auth/update-password`
- **Descrição**: Atualiza a senha do usuário autenticado.
- **Headers**:
  ```
  Authorization: Bearer <token>
  ```
- **Body**:
  ```json
  {
    "oldPassword": "senhaAntiga",
    "newPassword": "senhaNova"
  }
  ```
- **Retorno**:
  ```json
  {
    "message": "Senha atualizada com sucesso!"
  }
  ```
- **Códigos de Status**:
  - `200 OK` em caso de sucesso  
  - `401 Unauthorized` se o token for inválido ou a senha antiga estiver incorreta  
  - `404 Not Found` se o usuário não for encontrado

---

## Considerações Finais

- **Boas Práticas de Segurança**:  
  - Utilize um valor seguro para `JWT_SECRET` e guarde-o fora do código-fonte, por exemplo em variáveis de ambiente ou serviços de segredo.  
  - A “senha mestra” (`MASTER_PASSWORD`) deve ser usada com **cautela**, preferencialmente apenas em ambientes de desenvolvimento ou para fins administrativos controlados.

- **Escalonamento**:  
  - É possível adicionar recursos como recuperação de senha, confirmação de e-mail (via tokens), refresh tokens, gerenciamento de papéis (roles) e permissões com base em perfis.

- **Logs**:  
  - O logger `winston` grava logs em console e em arquivo (`logs/auth.log`). Em produção, é interessante configurar um gerenciador de logs centralizado.

- **Contribuição**:  
  - Crie novas _branches_ para cada feature/bugfix, faça _commits_ claros e abra _Pull Requests_ para manter a organização.  

---  

