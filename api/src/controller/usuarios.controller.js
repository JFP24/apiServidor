import User from "../models/usuarios.models.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";

export const registroUsuarios = async (req, res) => {
  try {
    const { password, email, username, rol } = req.body;
    if (!email || !password || !username) return res.status(400).json({ message: "Te faltan algunos espacios por llenar" });
    
    const userFound = await User.findOne({ email });
    if (userFound) return res.status(400).json({ message: "El email que intentas utilizar ya se encuentra en uso, intenta con otro diferente" });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: passwordHash,
      rol,
    });

    const userSaved = await newUser.save();

    const token = await createAccessToken({ id: userSaved._id });

    const user = {
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
      rol: userSaved.rol,
      createAt: userSaved.createdAt,
      updateAt: userSaved.updatedAt
    };

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Solo seguro en producción
      sameSite: 'Strict'
    });

    return res.status(202).json({ message: "Usuario creado correctamente", user });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ msg: "Error desde register" });
  }
};



export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const findUser = await User.findOne({ email });
      if (!findUser) return res.status(400).json({ message: "Usuario/Contraseña Invalida" });
  
      const passwordCompare = await bcrypt.compare(password, findUser.password);
      if (!passwordCompare) return res.status(400).json({ message: "Contraseña Incorrecta" });
  
      const token = await createAccessToken({ id: findUser._id });
  
      const user = {
        id: findUser._id,
        username: findUser.username,
        email: findUser.email,
        rol: findUser.rol,
      };
  
      res.cookie("token", token, {
        httpOnly: true,
        secure: true, // Solo seguro en producción
        sameSite: 'Strict'
      });
  
      return res.status(202).json({ user });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ msg: "Error desde login" });
    }
  };
  
  
  


export const logout = async (req, res)=> {
    try {
        res.cookie("token", "", {
            expires: new Date(0)
        })
        return res.sendStatus(200)
    }catch(error){
        console.log(error)
    }
}

export const profile = async (req, res) => {
    try {
      const { token } = req.cookies;
      if (!token) return res.status(401).json({ message: "Unauthorized" });
  
      jwt.verify(token, "toeknsecreto", async (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized" });
  
        const userFound = await User.findById(decoded.id).populate("hotel");
        if (!userFound) return res.status(400).json({ message: "Usuario no encontrado" });
  
        const habi = userFound.hotel.map(e => e.habitaciones);
  
        const obtenerHabitaciones = async () => {
          const lista = [];
  
          await Promise.all(habi.map(async (objectId) => {
            const habitaciones = await Promise.all(objectId.map(async (element) => {
              const habiDos = await Habitaciones.findById(element);
              return habiDos;
            }));
  
            const habitacionesFiltradas = habitaciones.filter(habitacion => habitacion !== null);
            lista.push(...habitacionesFiltradas);
          }));
  
          return lista;
        };
  
        obtenerHabitaciones()
          .then((resultado) => {
            const frontHotel = userFound.hotel.map((e) => {
              return {
                id: e._id,
                nombre: e.nombre,
                habitaciones: resultado
              };
            });
  
            const userProfile = {
              id: userFound._id,
              username: userFound.username,
              email: userFound.email,
              rol: userFound.rol,
              hotel: frontHotel
            };
  
            return res.status(202).json({ userProfile });
          });
      });
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: "Error from profile" });
    }
  };
  


  export const verifyToken = async (req, res) => {
    try {
      const { token } = req.cookies;
      if (!token) return res.status(401).json({ message: "Unauthorized" });
  
      jwt.verify(token, "toeknsecreto", async (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized" });
  
        const userFound = await User.findById(decoded.id);
        if (!userFound) return res.status(401).json({ message: "Unauthorized" });
  
        return res.json({
          id: userFound._id,
          username: userFound.username,
          email: userFound.email
        });
      });
    } catch (error) {
      console.log(error);
      return res.status(401).json({ message: "Error from verify" });
    }
  };
  

export const getUsuarios = async (req, res)=> {
    try {
        //en esta ruta debemos llevarlo es a el usuario el cual se crea la informacion
        //solo los que tengas el rol de superadmin pueda ver los hoteles y habitaciones de todos las plataformas activas
        //obtenemos la informacion de las habitacioes
        const usuarios = await User.find()
        console.log(usuarios)
        if(!usuarios) return res.status(301).message("NO HAY HABITACIONES CREADAS EN EL MOMENTO")
        //mapeamos el arrelgo para mandar un objeto a el front
        const usuariosFront = usuarios.map((e)=> {
            return {
                id : e._id,
                username : e.username,
                email : e.email,
                rol : e.rol,
                hotel : e.hotel
            }
        })

        console.log(usuariosFront)
        //respondemos el objeto
        return res.status(202).json(usuariosFront)
    } catch (error) {
        console.log(error)
        return res.status(401).json({message : "Error from geHome"})
    }
}


export const actualizarUsuarios= async (req, res)=> {
    try {
        const id = req.params.id
        if(!id) return res.status(404).json({message: "necesitas un id para poder actualizar "})
        //el new true es para modificar y me cambie los valores mandados por el vody
        console.log(req.body, "this is the body")
        const actualizar = await User.findByIdAndUpdate(id, req.body , { new : true} )
        if(!actualizar) return res.status(404).json({message: "usuario no encontrada"})
        return res.status(202).json({actualizar})
    } catch (error) {
        return res.status(404).json({message: "error de actualizarUsuario"})
    }
}
