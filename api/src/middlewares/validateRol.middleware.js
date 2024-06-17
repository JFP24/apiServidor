
import User from "../models/usuarios.models.js"


export const validateRolClient = async (req, res, next) => {
    try {
      //verificamos el id del usuario en el modelo, y ese user tendra una propiedad rol
      const user = await User.findById(req.user.id);
      console.log(user.rol)
      if(user.rol === "administrador"){
        next()
      }else  {
        return res.status(404).json({ message: "no tienes authorizacion para acceder a esta pagina" });
      }
      
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: "Error desde is rol de administrador" });
    }
  };





//   const roles = await Role.find({ _id: { $in: user.roles } });
//   const findRol = roles.map((r) => r.name);
//   console.log(findRol);
//   if (findRol[0] === "moderater" || findRol[1] === "admin") {
//     next();
//   }