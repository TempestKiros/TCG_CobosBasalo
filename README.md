# TCG-Gestos-de-Algo-xD

proyecto de autenticación completo en React + Express con:

✅ Login
✅ Registro
✅ Recuperación de contraseña
✅ Protección de rutas con JWT
✅ Estructura organizada para que sea fácil de mantener

🧱 ESTRUCTURA DEL PROYECTO
Vamos a dividirlo en dos carpetas principales:

-----------------------------------------------------------------------------------------------------

auth-app/
├── client/      ← React (Frontend)
└── server/      ← Express + JWT (Backend)
📦 client/ - Proyecto React
Puedes crearlo así:

-----------------------------------------------------------------------------------------------------

npx create-react-app client
cd client
npm install react-router-dom react-hook-form axios
Estructura recomendada del cliente:

-----------------------------------------------------------------------------------------------------

client/
├── public/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   ├── services/
│   │   └── authService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
⚙️ server/ - Proyecto Node + Express
Puedes crearlo así:

-----------------------------------------------------------------------------------------------------

bash

mkdir server
cd server
npm init -y
npm install express cors bcryptjs jsonwebtoken body-parser nodemailer
Estructura recomendada del servidor:
pgsql

-----------------------------------------------------------------------------------------------------

server/
├── controllers/
│   └── authController.js
├── routes/
│   └── authRoutes.js
├── middleware/
│   └── verifyToken.js
├── utils/
│   └── sendEmail.js
├── users.json          ← Simulando una base de datos
├── .env
├── server.js
🔐 Flujo del sistema

-----------------------------------------------------------------------------------------------------

Frontend

Login.jsx → llama a authService.login()

Register.jsx → llama a authService.register()

ForgotPassword.jsx → llama a authService.recoverPassword()

ProtectedRoute.jsx → protege rutas que requieren autenticación

-----------------------------------------------------------------------------------------------------

Backend
/register → guarda usuario nuevo (simulado con archivo JSON)

/login → valida y genera JWT

/forgot-password → envía email simulado

/dashboard → protegido por middleware verifyToken

-----------------------------------------------------------------------------------------------------


⚡ ¿Qué sigue?

Puedo pasarte los archivos paso a paso:

Primero: Login.jsx, Register.jsx, ForgotPassword.jsx con su lógica.

Luego: authService.js para la conexión con el backend.

Después: todo el backend en Express, listo para levantar con node server.js.


