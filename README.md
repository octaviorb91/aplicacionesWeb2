# Plataforma E-Commerce (Full Stack) - Gestión de Usuarios

Este proyecto es una aplicación web Full Stack orientada al comercio electrónico, desarrollada como parte de la currícula de Aplicaciones Web 2 (IES). El enfoque principal del repositorio está en la arquitectura del Backend (API REST) y la implementación de un sistema seguro de autenticación y gestión de usuarios, integrado con una interfaz Frontend interactiva.

## Tecnologías Utilizadas

**Frontend:**
* HTML5, CSS3 y JavaScript (Vanilla).
* Bootstrap para diseño responsivo y maquetación de vistas.

**Backend & Base de Datos:**
* Node.js y Express.js para la creación del servidor y enrutamiento.
* MongoDB (NoSQL) para el almacenamiento flexible de datos.

**Seguridad:**
* **Bcrypt:** Encriptación y hashing de contraseñas de usuarios.
* **JWT (JSON Web Tokens):** Manejo seguro de sesiones y caducidad de tokens para el inicio de sesión.

## Instalación y Ejecución Local

Para correr este proyecto en tu entorno local, sigue estos pasos:

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/octaviorb91/AplicacionesWeb2.git](https://github.com/octaviorb91/AplicacionesWeb2.git)
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Ejecuta el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
*(Nota: El archivo `.env` con las variables de entorno necesarias para la conexión y el secret de JWT se encuentra incluido temporalmente en este repositorio para facilitar la revisión del proyecto).*

