import User from "../models/usuarios.models.js"
import bcrypt from "bcryptjs"
import {createAccessToken} from "../libs/jwt.js"
import jwt from "jsonwebtoken"
import Habitaciones from "../models/habitaciones.models.js"


export const registroUsuarios = async (req, res )=> {
    try {
        //obtenemos la informacion por el request body
        console.log(req.body)
        const { password, email,username, rol} = req.body
        if(!email, !password, !username) return res.status(400).json({message: "Te faltan Algunos espacios por llenar"})
        const userFound = await User?.findOne({email})
        if(userFound) return res.status(400).json({message: "El email que intentas utilizar ya se encuentra en uso , intenta con otro diferente"})

        //hasheamos la constraseña para tener encriptada
        const passwordHash = await bcrypt.hash(password, 10)
        //creamos una instancia del usuario creado
        const newUser = new User({
            username,
            email,
            password: passwordHash,
            rol,

        })
//se guarda en la base de datos
const userSaved = await newUser.save()
//console.log(userSaved)

const token = await createAccessToken({id : userSaved._id})

//creamos un objeto con la informacion para enviar a el frontend
const user = {
    id: userSaved._id,
    username : userSaved.username,
    email : userSaved.email,
    rol :userSaved.rol,
    createAt : userSaved.createdAt,
    updateAt: userSaved.updatedAt
}
//creamos una cookie con el token para guardar la sesion
res.cookie("token", token, {
    httpOnly: true,
    secure: true, // Asegúrate de que esto está configurado a true si estás usando HTTPS
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000 // Esto permite que las cookies se envíen entre sitios
  });
 //response message and user
 return res.status(202).json({message : "Usuario creado correctamente" , user})
    }catch(error){
    console.log(error)
    return res.status(400).send({msg : "Error desde register"})
    }
    }




    export const login = async (req , res)=>{
        try {
            //traemos la informacion del body
            const {email, password}=req.body
            //buscamos el la db si el usuario existe
            const findUser = await User?.findOne({email})
            //si no existe en la base de datos enviamos un mensaje de error
             if(!findUser) return res.status(400).json({message:"Usuario/Contraseña Invalida"})
             //si existe comparamos con la password hasehada para confirmar si es correcta
             const passwordCompare = await bcrypt.compare(password , findUser.password)
             //si la contraseña es incorrecta mandamos un mensaje de error
             if(!passwordCompare) return res.status(400).json({message:"Contraseña Incorrecta"})
            //creamos un objeto con la inforamcion del usuario para el frontend
            const user = {
                id: findUser._id,
                username : findUser.username,
                email : findUser.email,
                rol : findUser.rol,
            }
            console.log(user)
             //creamos el token con el id
    const token = await createAccessToken({id: findUser._id})
    //retornamos la cookie con el token
    res.cookie("token", token, {
        httpOnly: true,
        secure: true, // Asegúrate de que esto está configurado a true si estás usando HTTPS
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000 // Esto permite que las cookies se envíen entre sitios
      });
    //retornamos la inforamcion del usuario
    return res.status(202).json({user})
        } catch (error) {
            console.log(error)
            return res.status(400).send({msg : "Error desde login  "})

        }
    }


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

export const profile = async (req, res)=>{
    try {
        //obtenemos la informacion del usuario cuando este logueado
       const userFound = await User.findById(req.user.id).populate("hotel")
      // console.log(userFound)
       if(!userFound) return res.status(400).json({message : "Usuario no encontrado"})
        const habi = userFound.hotel.map(e=> {return e.habitaciones})

     //  console.log(habi)
    
        const obtenerHabitaciones = async () => {
            const lista = [];
          
            await Promise.all(habi.map(async (objectId) => {
              const habitaciones = await Promise.all(objectId.map(async (element) => {
                const habiDos = await Habitaciones.findById(element);
                return habiDos;
              }));
          
              // Filtrar resultados nulos antes de agregarlos a la lista
              const habitacionesFiltradas = habitaciones.filter(habitacion => habitacion !== null);
              lista.push(...habitacionesFiltradas);
            }));
          
            return lista;
          };
          
          obtenerHabitaciones()
            .then((resultado) => {
            //  console.log(resultado);
              // Aquí puedes hacer lo que necesites con la lista de habitaciones
              const frontHotel = userFound.hotel.map((e) => {
                return {
                  id: e._id,
                  nombre: e.nombre,
                  habitaciones: resultado
                };
              });
          
              // Aquí puedes usar `frontHotel` como necesites
              const userProfile = {
                id : userFound._id,
                username : userFound.username ,
                email : userFound.email,
                password : userFound.password,
                rol : userFound.rol,
                hotel : frontHotel
        
        
              }
               //  console.log(userProfile)
                return res.status(202).json({userProfile})
            })
        
    
      
        


    } catch (error) {
        console.log(error)
        return res.status(404).json({message : "Error from profile"})
    }
}


export const verifyToken = async (req, res)=> {
    try {
        const {token}= req.cookies
        console.log(token)
        if(!token) return res.status(401).json({message:"Unauthorized"})
        jwt.verify(token, "toeknsecreto", async  (err,user)=>{
            if(err) return res.status(401).json({message:"Unauthorized"})
            const userFound = await User.findById(user.id)
            if(!userFound) return res.status(401).json({message:"Unauthorized"})
            return res.json({
                id: userFound._id,
                username :userFound.username,
                email : userFound.email
            })
        })

    } catch (error) {
        console.log(error)
        return res.status(401).json({message:"Error from verify"})
    }
}


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
