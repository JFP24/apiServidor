import mongoose from "mongoose";
//Creamos el schema , un objeto con las propiedades que queremos validar en la DB de mongodb
const hotelSchema = new mongoose.Schema({
    nombre : {
        //tipo
        type :String,
        required : true,    
    },   
 
    habitaciones : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Habitacion' }],
   

  
}
)

//Creamos un modelo para saber como se van a guardar o donde se van a guardar los datos en la db
export default mongoose.model("Hotel", hotelSchema)