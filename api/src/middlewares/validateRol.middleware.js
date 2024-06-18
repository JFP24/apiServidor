
import User from "../models/usuarios.models.js"
import jwt from "jsonwebtoken"


export const validateRolClient = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, 'toeknsecreto'); // Reemplaza 'your_jwt_secret' con tu clave secreta JWT
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.rol === "Admin") {
      next();
    } else {
      return res.status(403).json({ message: "No tienes autorización para acceder a esta página" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error desde is rol de administrador" });
  }
};


