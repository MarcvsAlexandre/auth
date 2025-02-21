# Usando uma imagem leve do Node.js
FROM node:18-alpine

# Definindo o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos necessários para o build
COPY package.json package-lock.json ./

# Instalando as dependências
RUN npm install

# Copiando o restante do código para o container
COPY . .

# Definindo a porta que o container vai expor
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "run", "dev"]
