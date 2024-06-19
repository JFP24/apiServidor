import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import http from 'http';
import { Server } from 'socket.io';
import cors from "cors";
import { connectDb } from "./db.js";
import habitaciones from "./src/routes/habitaciones.routes.js";
import hotel from "./src/routes/hotel.routes.js";
import usuarios from "./src/routes/usuarios.routes.js";
import dimaster from "./src/routes/dimaster.routes.js";
import users from "./src/models/usuarios.models.js";
import bcrypt from "bcryptjs";
import { connectAndFetchData } from './src/controller/conectarPeriodica.js'; // Importa la función para tareas periódicas

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://clientservidor.onrender.com",
    methods: ["GET", "POST"],
    credentials: true // Permitir cookies de origen cruzado
  }
});

// Morgan me devuelve los estados de nuestras peticiones http
app.use(morgan("dev"));
// express.json me deja leer objetos json en las rutas
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "https://clientservidor.onrender.com",
  credentials: true // Permitir cookies de origen cruzado
}));

app.use((req, res, next) => {
  console.log('Cookies in Request:', req);
  next();
});

app.use("/api/v1", dimaster);
app.use("/api/v1", habitaciones);
app.use("/api/v1", hotel);
app.use("/api/v1", usuarios);

const createAdminUser = async () => {
  try {
    const adminEmail = "diseven@diseven.com";
    const adminExists = await users.findOne({ email: adminEmail });
    const passwordHash = await bcrypt.hash("admin", 10);
    if (!adminExists) {
      const adminUser = new users({
        username: "admin",
        email: adminEmail,
        password: passwordHash, // Asegúrate de cifrar la contraseña antes de guardar
        rol: "Admin"
      });
      await adminUser.save();
      console.log("Usuario admin creado exitosamente.");
    } else {
      console.log("Usuario admin ya existe.");
    }
  } catch (error) {
    console.error("Error creando usuario admin:", error);
  }
};

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);

  // se conecta automaticamente a el topico de los hoteles
  connectAndFetchData();
  // createAdminUser();
});

import fernet from 'fernet';

const secret = new fernet.Secret("xshaRo1BvCdBhXhSbQsIBKNvyzZ2ouqx2UPa36az6eU=");
const token = new fernet.Token({
  secret: secret,
  token: 'gAAAAABmcxXRCAyPIOTqCIKfwA6Gwfa4H6vqeAUgMY6JuExX-bMrxkb1GVugRV7iwNpSBJgVX6PnLGMTQ4oOLhr3FhBaAhtAjsXGxt5LK6InwMjGT_dCilZ9V0rJWOk6MghciyBaUBaucTWsrj5T6xq4YXZSLrWKrY5Lf9Tu4nrCThuLkFDkn8J389Eu0UcYMhTQwH4WCYERWNru4vEgPrD3cu8ZwTiuZ9O1XSaLlwn55q2XkfwtW1bUBW7rc1TPayNFzkePWo30b_RscrRBlRg0sa0BvMqRO_OrCCVGkTeWBCvC6KOpVz1QR0YAAxPYBtlSV9U3svMW3zvvkQTSU-2DAN_e38rQTPo0zGkH4Ae8s0v1UUEitrh-R1IwbTS-7Os-ZpGZyiVKGWkodI_9S6eOxdyM05xUUHqk9zZH29_jwqW8Szs3oC72UXQ2sX1ukzgiI9wk9HqJey6DujaqhzjRQ-tXwXebs2O26Uu8RnVzlg_X5uGbYmjjYx6UnnkzPTKudN9cFsnS',
  ttl: 0
});

const decodedMessage = token.decode();
try {
  const jsonMessage = JSON.parse(decodedMessage);
  console.log(jsonMessage);
} catch (error) {
  console.error("Error parsing JSON:", error);
}

connectDb();
export { app, io };
