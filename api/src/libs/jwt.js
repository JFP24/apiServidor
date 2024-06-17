
import jwt from "jsonwebtoken"


//funcion para crear un token cuando se necesite 
export const createAccessToken= ((payload)=>{
//creamos una promesa para 
return new Promise((resolve , reject)=> {

jwt.sign(

    //llega el id del usuario a le que se le esta creando el token
        payload ,
        "toeknsecreto",
        {
            expiresIn : "1d"
        },
        (err , token)=> {
            if(err) reject(err)
            resolve(token)
        }
        
    )


})
})
    