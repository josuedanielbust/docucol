# Etapa de build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa de producción
FROM node:22-alpine

WORKDIR /app

# Instalar "serve" para servir archivos estáticos
RUN npm install -g serve

# Copiar archivos construidos
COPY --from=builder /app/build /app/build

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
