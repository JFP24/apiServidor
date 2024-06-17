import Habitaciones from "../models/habitaciones.models.js"
import Hotel from "../models/hotel.models.js"

export const getHabitaciones = async (req, res)=> {
    try {
        //en esta ruta debemos llevarlo es a el usuario el cual se crea la informacion
        //solo los que tengas el rol de superadmin pueda ver los hoteles y habitaciones de todos las plataformas activas
        //obtenemos la informacion de las habitacioes
        const habitaciones = await Habitaciones.find()
      //  console.log(habitaciones)
        if(!habitaciones) return res.status(301).message("NO HAY HABITACIONES CREADAS EN EL MOMENTO")
        //mapeamos el arrelgo para mandar un objeto a el front
        const fronthabitaciones = habitaciones.map((e)=> {
            return {
                id : e._id,
                numeroHabitacion : e.numeroHabitacion,
                correo : e.correo,
                hostLocal :e.hostLocal,
                topicLocal : e.topicLocal ,
                topicExterno :  e.topicExterno
            }
        })
        //respondemos el objeto
        return res.status(202).json(fronthabitaciones)
    } catch (error) {
        console.log(error)
        return res.status(401).json({message : "Error from geHome"})
    }
}

export const createHabitaciones = async (req, res)=> {
    try {
        //los que van a poder crear habitaciones son los administradores del hotel
            //obtenemos la informacion por el body
            const {numeroHabitacion , 
                correo, 
                hostLocal, 
                topicLocal, 
                topicExterno,
                categoria, 
                detalles
        }= req.body

        

          //  if(!id) return res.status(404).json({message : "se necesita el id para crear habitaciones"})
            //creamos una instancia del proyecto
            const newHabitacion = new Habitaciones({
                numeroHabitacion , 
                correo, 
                hostLocal, 
                topicLocal, 
                topicExterno,
                categoria, 
                detalles
            }) 
           // console.log(newHabitacion)
            //guardamos en la db
           const habitacion=  await newHabitacion.save()

        //id del hotel
        const {id} = req.params
        console.log(id)
        //  //obtenemos el hotel al cual queremos guardar las habitaciones
           const hotel = await Hotel.findById(id);
           console.log(hotel)
        //    //le agregamos al arreglo de las habitaciones las nuevas habitaciones que se van creando con el id
          hotel.habitaciones.push(habitacion._id)
        //    //guardamos las actualizaciones
            const hotelActualizado = await hotel.save()
        //      console.log(hotelActualizado)
           //retornamos mensaje de exito
           return res.status(202).json({message: "habitacion creada correctamente", habitacion})
        
    } catch (error) {
        console.log(error)
        return res.status(401).json({message : "Error from createHabitacion"})
    }
}

export const habitacionesById = async (req, res)=> {
    try {
          //obtenes id de la tarea que queremos
    const id = req.params.id
    //buscamos la tarea especifica con el id
    const habitacionesById = await Habitaciones.findById(id).populate("huesped")
    console.log(habitacionesById)
    //si no existe hotel devolvemos mensaje de error
    if(!habitacionesById) return res.status(400).json({message: "habitacion no encontrada"})
     const habitacion = {
        id : habitacionesById._id,
       numeroHabitacion :habitacionesById.numeroHabitacion , 
       correo : habitacionesById.correo, 
       hostLocal : habitacionesById.hostLocal, 
       topicLocal: habitacionesById.topicLocal, 
       topicExterno: habitacionesById.topicExterno,
       conectado : habitacionesById.conectado,
       estado : habitacionesById.estado,
       categoria : habitacionesById.categoria,
       detalles : habitacionesById.detalles,
       huesped : habitacionesById.huesped
   
}
    //retornamos la tarea
   return res.status(202).json(habitacion)
    } catch (error) {
        console.log(error)
        return res.status(401).json({message : "Error from habitacionesById"})
    }
}


export const eliminarHabitacion = async (req, res)=> {
    try {
//obtenemos id por params
const id = req.params.id

//eliminamos de la db con el id obtenido
const habitacionId = await Habitaciones.findByIdAndDelete(id)
//validamos si podemos eliminar
if(!habitacionId)  return res.status(400).json({message:"habitación no encontrada"})
return res.status(202).json({message:"Habitacion eliminada correctamente"})
    }catch (error){
        console.log(error)
        return res.status(401).json({message: "Error de eliminar habitación"})
    }
}

export const actualizarHabitacion= async (req, res)=> {
    try {
        const id = req.params.id
        //el new true es para modificar y me cambie los valores mandados por el vody
        console.log(req.body)
        const actualizarHabitacion = await Habitaciones.findByIdAndUpdate(id, req.body , { new : true} )
        if(!actualizarHabitacion) return res.status(404).json({message: "habitación no encontrada"})
        return res.status(202).json({message: "Habitacion Actualizada correctamente",actualizarHabitacion})
    } catch (error) {
        return res.status(404).json({message: "error de actualizarHabitacion"})
    }
}