import Hotel from "../models/hotel.models.js"
import Habitaciones from "../models/habitaciones.models.js"
import Usuarios from "../models/usuarios.models.js"


export const getHotel = async (req, res)=> {
    try {
        //obtenemos la informacion de los hoteles con las habitaciones
        const hotelFind = await Hotel.find()  //.populate("habitaciones")
     //console.log(hotelFind)
        if(hotelFind.length === 0) return res.status(401).json({message: "por el momento no hay ningun hotel creado"})
        //mapeamos el arreglo y devolvemos uno nuevo con las propiedades que necesita el front
        const habitacionesId = hotelFind.map(e=>e.habitaciones)
        const array = habitacionesId.map(elemento => ( elemento ));
      
    //    array.forEach((objectId ) => {
    //        objectId.forEach(async (element)=>{
    //         const habi = await Habitaciones.findById(element)
          
    //         console.log(habi)
    //        })
    //       });
          const obtenerHabitaciones = async () => {
            const lista = [];
          
            await Promise.all(array.map(async (objectId) => {
              const habitaciones = await Promise.all(objectId.map(async (element) => {
                const habi = await Habitaciones.findById(element);
                return habi;
              }));
          
              lista.push(...habitaciones);
            }));
          
            return lista;
          };
          
          // Llamada a la función y manejo del resultado
          obtenerHabitaciones()
            .then((resultado) => {
             
              // Aquí puedes hacer lo que necesites con la lista de habitaciones
              const frontHotel = hotelFind.map((e)=> {
                return {
                    id : e._id,
                    nombre : e.nombre,
                    usuario : e.creadoPor,
                    //habitaciones : resultado
                }
            })
    
            return res.status(202).json(frontHotel)
            })
            .catch((error) => {
              console.error('Error:', error);
          });

    
      
       
    } catch (error) {
        console.log(error)
        return res.status(401).json({message : "Error from getHotel"})
    }
}

export const crearHotel = async (req, res)=> {
    try {
       
            //obtenemos la informacion por el body
            const {nombre }= req.body
            console.log(req.body)
            if(!nombre) return res.status(400).json({message:"Tal vez te falten algunos espacios por llenar"})
            //const {id} = req.params
            //console.log(id)
            //  //obtenemos el usuario al cual queremos guardar el hotel
              // const user = await Usuarios.findById(id);
              // console.log(user)
           //    const creadoPor = user.username
            //creamos una instancia del proyecto
            const newHotel = new Hotel({
                nombre  ,
              
                
            }) 
            //guardamos en la db
           const hotels=  await newHotel.save()
       
             // console.log(user)
              
           //    //le agregamos al arreglo de las habitaciones las nuevas habitaciones que se van creando con el id
          // user.hotel.push(hotels._id)
           //    //guardamos las actualizaciones
             //await user.save()
                //console.log(hotels)

                const frontHotels = {
                    id: hotels.id,
                    nombre : hotels.nombre,
                    //usuario : user.email,
                    habitaciones : hotels.habitaciones,
                   
                }
                console.log(frontHotels)
           //retornamos mensaje de exito
           return res.status(202).json({message: "Hotel creado exitosamente", frontHotels})
    } catch (error) {
        console.log(error)
        return res.status(401).json({message : "Error from createHome"})
    }
}

export const hotelById = async (req, res)=> {
        try {
        //obtenemos el id dl hotel al cual queremos tener la informacion    
        const id = req.params.id
        //buscamos el hotel
        const hotelById = await Hotel.findById(id).populate("habitaciones")
        //console.log(hotelById)
        //si no existe hotel devolvemos mensaje de error
        if(!hotelById) return res.status(400).json({message: "hotel no encontrado"})
        //devolvemos un objeto con la informacion que necesita el front
        const hotel = { 
            id : hotelById._id,
            nombre : hotelById.nombre,
            direccion : hotelById.direccion,
            creadoPor : hotelById.creadoPor,
            habitaciones : hotelById.habitaciones,
        }
        //retornamos informacion del hotel
    return res.status(202).json(hotel)
        } catch (error) {
            console.log(error)
            return res.status(401).json({message : "Error from hotelById"})
        }
}

export const eliminarHotel = async (req, res)=> {
    try {
//obtenemos id por params
const id = req.params.id
//eliminamos de la db con el id obtenido
const hotelId = await  Hotel.findById(id).populate("habitaciones")
//validamos si podemos eliminar
if(!hotelId)  return res.status(400).json({message:"hotel no encontrada"})
const habitaciones = hotelId.habitaciones.map(e=>e._id)
habitaciones.forEach(async (id)=> await Habitaciones.findByIdAndDelete(id))

await Hotel.findByIdAndDelete(id)


return res.status(202).json({message:"Hotel eliminado correctamente"})
    }catch (error){
        console.log(error)
        return res.status(401).json({message: "Error de eliminar Hotel"})
    }
}

export const actualizarHotel= async (req, res)=> {
    try {
        const id = req.params.id
        if(!id) return res.status(404).json({message: "necesitas un id para poder actualizar "})
        //el new true es para modificar y me cambie los valores mandados por el vody
        console.log(req.body, "this is the body")
        const actualizarHotel = await Hotel.findByIdAndUpdate(id, req.body , { new : true} )
        if(!actualizarHotel) return res.status(404).json({message: "hotel no encontrada"})
        return res.status(202).json({actualizarHotel})
    } catch (error) {
        return res.status(404).json({message: "error de actualizarHotel"})
    }
}