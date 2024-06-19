import jwt from 'jsonwebtoken';

export const authRequired = (req, res, next) => {
  try {
    // Extraemos el token de las cookies
    const { token } = req.cookies;
    console.log(req.cookies);
    console.log(token, "este es el token ");

    // Validamos que el token esté presente
    if (!token) return res.status(401).json({ message: "Acceso denegado, no estás logueado" });

    // Verificamos que el token sea válido
    jwt.verify(token, "toeknsecreto", (err, user) => {
      // Si hay un error responde con un mensaje de error
      if (err) return res.status(401).json({ message: "Token inválido" });

      // Pasamos el user a req.user para poder obtener el usuario
      req.user = user;
      // Si está todo bien sigue la siguiente función
      next();
    });

  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "Error en middleware authRequired" });
  }
}



//una funcion midleware es una funcion que se ejecuta antes de la principal en las rutas , 
//esto se utiliza para proteger rutas y para validar informacion 