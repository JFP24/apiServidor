import jwt from "jsonwebtoken"



//esta es una funcion midleware , se usa el next para diferencias que es una funcion midleware
export const authRequired = (req, res, next )=> {
try {
    //extraemos el token de las cookies 
    const {token} = req.cookies
    console.log(req.cookies)
    console.log(token, "este es el tekn ")
    //validamos que si entre el token
    if(!token) return res.status(401).json({message: "Acceso denegado, no estas logueado"})
    //verificamos que el token sea valido
    jwt.verify(token, "toeknsecreto", (err, user)=>{
    //si salta un errr respondes mensaje de error
    if(err) return res.status(401).json({message:"Invalid Token"})
    //pasamos el user a las req.user para poder obtener el usuario
    req.user = user
    //si esta todo bien sigue la siguiente funcion
    next()
    })
    
} catch (errr) {
    console.log(errr)
    return res.status(404).json({message: "Error in midleware authRequired"})
}   
}



//una funcion midleware es una funcion que se ejecuta antes de la principal en las rutas , 
//esto se utiliza para proteger rutas y para validar informacion 