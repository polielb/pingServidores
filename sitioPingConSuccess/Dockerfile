# Usar una imagen base de Node.js
FROM node:14

# Establecer el directorio de trabajo en /app
WORKDIR /app

# Copiar el archivo programa.js al contenedor
COPY programa.js .

# Copiar la carpeta public al contenedor
COPY public ./public

# Instalar las dependencias
RUN npm init -y && npm install express body-parser

# Exponer el puerto 3000 del contenedor
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "programa.js"]

