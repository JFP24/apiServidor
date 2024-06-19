import jwt from "jsonwebtoken";

// Función para crear un token de acceso
export const createAccessToken = (payload) => {
  // Crear una promesa para el token
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload, // Datos del usuario que se incluirán en el token
      "toeknsecreto", // Clave secreta para firmar el token
      { expiresIn: "1d" }, // Configuración del token (expira en 1 día)
      (err, token) => {
        if (err) {
          reject(err); // Rechazar la promesa si hay un error
        } else {
          resolve(token); // Resolver la promesa con el token generado
        }
      }
    );
  });
};