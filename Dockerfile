# Usar una imagen base de Apache con PHP
FROM php:7.4-apache

# Instalar las extensiones necesarias de PHP
RUN docker-php-ext-install mysqli

# Copiar los archivos del sitio web al contenedor
COPY sitio /var/www/html

# Exponer el puerto 80 para que el servicio web sea accesible
EXPOSE 80

# CMD para ejecutar el servicio web al iniciar el contenedor
CMD ["apache2-foreground"]
