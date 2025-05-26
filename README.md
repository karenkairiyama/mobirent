# Mobirent: Sistema de Alquiler de Vehículos

¡Bienvenido a Mobirent! Esta guía te ayudará a configurar y ejecutar la aplicación de sistema de alquiler de vehículos en tu entorno de desarrollo local.

---

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu sistema:

1.  **Node.js y npm (Node Package Manager)**:
    * Puedes descargarlos desde el sitio oficial: [nodejs.org](https://nodejs.org/)
    * Para verificar si ya los tienes instalados, abre tu terminal y ejecuta:
        ```
        node -v
        npm -v
        ```

2.  **Git**:
    * Descarga e instala Git desde [git-scm.com/downloads](https://git-scm.com/downloads/).
    * Verifica la instalación:
        ```
        git --version
        ```

3.  **MongoDB Atlas**:
    * Tu aplicación utiliza MongoDB Atlas para la base de datos en la nube. **No necesitas instalar MongoDB localmente**, pero sí una cuenta de Atlas y la **cadena de conexión (URI)** de tu clúster existente. Si aún no tienes un clúster, puedes crear uno gratuito aquí: [mongodb.com/atlas](https://www.mongodb.com/atlas).

---

## 📋 Pasos para la Configuración

Sigue estos pasos para poner en marcha el backend y el frontend de Mobirent.

### Paso 1: Clonar el Repositorio

1.  Abre tu terminal y navega al directorio donde quieres guardar el proyecto. Por ejemplo:
    ```
    cd D:/Proyectos/
    # O en macOS/Linux: cd ~/Documents/Proyectos/
    ```

2.  Clona el repositorio de Mobirent desde GitHub. Ve a tu repositorio en GitHub, copia la URL HTTPS (botón verde "Code") y ejecuta:
    ```
    git clone https://github.com/FerrerThomas/mobirent.git
    ```

3.  Navega al directorio raíz del proyecto clonado:
    ```
    cd mobirent
    ```

---

### Paso 2: Configurar y Ejecutar el Backend

1.  Navega al directorio `backend`:
    ```
    cd backend
    ```

2.  Instala todas las dependencias necesarias:
    ```
    npm install
    ```

3.  **Crea el archivo de variables de entorno `.env`**:
    * En la raíz de la carpeta `backend`, crea un nuevo archivo llamado `.env`.
    * Copia y pega la siguiente configuración, **reemplazando los valores de `MONGO_URI` y `JWT_SECRET`** con los que usas para tu clúster de MongoDB Atlas y tu clave secreta de JWT:
        ```dotenv
        NODE_ENV=development
        PORT=5000
        MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
        JWT_SECRET=tu_clave_secreta_jwt_muy_larga_y_segura
        ```
        * **`MONGO_URI`**: Esta debe ser la URI de conexión de tu clúster de MongoDB Atlas. Es crucial que sea la misma que usas en cualquier otra máquina.
        * **`JWT_SECRET`**: Usa la misma clave secreta que configuraste previamente para que los tokens de sesión sean válidos.

4.  Inicia el servidor del backend:
    ```
    npm run dev
    ```
    Verás un mensaje en tu terminal indicando que el servidor está corriendo en el puerto 5000.

---

### Paso 3: Configurar y Ejecutar el Frontend

1.  Abre **otra terminal** (o una nueva pestaña en la misma terminal).

2.  Navega de nuevo a la raíz de tu proyecto y luego al directorio `frontend`:
    ```
    cd ..         #Para volver a la raíz del proyecto
    cd frontend   (deberia dejarte en algo como ...mobirent/frontend )
    ```

3.  Instala todas las dependencias necesarias para el frontend:
    ```
    npm install
    ```

4.  Inicia la aplicación React (frontend):
    ```
    npm run dev
    ```
    Vite (o tu bundler de desarrollo) iniciará la aplicación. Verás una URL local, usualmente `http://localhost:5173`.

---

## 🎉 Acceder a la Aplicación

1.  Abre tu navegador web.
2.  Copia y pega la URL que te proporcionó el comando `npm run dev` (ej. `http://localhost:5173`) en la barra de direcciones.

¡Ahora la aplicación Mobirent debería estar funcionando en tu máquina local, conectada a tu base de datos de MongoDB Atlas!

---

## 🛠️ Solución de Problemas Comunes (Troubleshooting)

Si encuentras algún problema, aquí tienes algunas soluciones comunes:

* **"Connection refused" / "Network Error" en el frontend**:
    * Asegúrate de que el **servidor backend esté corriendo** en el puerto 5000.
    * Verifica que tu `MONGO_URI` en `backend/.env` sea **correcta y completa**.
    * Confirma que tu **clúster de MongoDB Atlas esté activo** y accesible (puedes probar la conexión desde la interfaz de Atlas).

* **Errores de CORS**:
    * Asegúrate de que `cors()` esté correctamente configurado en `backend/server.js`.

* **Errores de autenticación JWT**:
    * Verifica que `JWT_SECRET` en `backend/.env` sea **idéntico** al que usaste cuando creaste los usuarios.
    * Si lo cambiaste, los tokens antiguos no funcionarán; deberás iniciar sesión de nuevo o registrar un nuevo usuario.

---