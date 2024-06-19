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
import bcrypt from "bcryptjs"
import { connectAndFetchData  } from './src/controller/conectarPeriodica.js'; // Importa la función para tareas periódicas

const app = express();

const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"]
//   }
// });
const io = new Server(server, {
  cors: {
    origin: "https://clientservidor.onrender.com",
    methods: ["GET", "POST"]
  }
});

// Morgan me devuelve los estados de nuestras peticiones http
app.use(morgan("dev"));
// express.json me deja leer objetos json en las rutas
app.use(express.json());
app.use(cookieParser());
// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true
// }));
app.use(cors({
  origin: "https://clientservidor.onrender.com",
  credentials: true
}));

app.use("/api/v1", dimaster);
app.use("/api/v1", habitaciones);
app.use("/api/v1", hotel);
app.use("/api/v1", usuarios);

const createAdminUser = async () => {
  try {
    const adminEmail = "diseven@diseven.com";
    const adminExists = await users.findOne({ email: adminEmail });
    const passwordHash = await bcrypt.hash("admin", 10)
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
createAdminUser()

});




connectDb();
export { app, io };
