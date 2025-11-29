# Usa a imagem oficial do Node.js mais recente para desenvolvimento
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app
ENV WATCHPACK_POLLING=true
ENV NEXT_WEBPACK_USEPOLLING=1
# Copia os arquivos de configuração do projeto e da dependência
COPY package.json package-lock.json ./

# Instala as dependências (incluindo as de desenvolvimento)
# O ambiente de desenvolvimento precisa de todas as dependências
RUN npm install

# Copia o restante dos arquivos (código-fonte) para o container
COPY . .

# Expõe a porta que o Next.js usa por padrão
EXPOSE 3000

# Define o comando padrão para rodar o app em modo de desenvolvimento
# Este comando será sobrescrito pelo docker-compose para rodar o 'dev'
CMD ["npm", "run", "dev"]