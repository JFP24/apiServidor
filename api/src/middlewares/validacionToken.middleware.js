import jwt from 'jsonwebtoken';

export const authRequired = (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, "toeknsecreto", (err, user) => {
      if (err) return res.status(401).json({ message: "Token inválido" });

      req.user = user;
      next();
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "Error en middleware authRequired" });
  }
};



//una funcion midleware es una funcion que se ejecuta antes de la principal en las rutas , 
//esto se utiliza para proteger rutas y para validar informacion 