import mongoose from "mongoose";
//Creamos el schema , un objeto con las propiedades que queremos validar en la DB de mongodb
const habitacionSchema = new mongoose.Schema({
    habitacionID : {
        type : String,
        //required : true,
    },
    numeroHabitacion : {
        type : String,
        required : true,
    },
    hostLocal : {
        //tipo
        type :String,
       //required : true,    
    },
    hostExterno : {
        type: String,
        default :"diseven7.ddns.net"
    },
    topicLocal : {
        //tipo
        type :String,
        //required : true,     
    },
    topicExterno : {
        //tipo
        type :String,
       // required : true,     
    },
    estado : {
        type :Number,
       default: 0,
       //required : true,
    },

    noMolestar: {
        type : Number,
        required : true,
        default : 0
    },
    
    noAseo: {
        type : Number,
        required : true,
        default : 0
    },
    lavanderia: {
        type : Number,
        required : true,
        default : 0
    },
    houseKeeping: {
        type : Number,
        required : true,
        default : 0
    },
    puerta: {
        type : Number,
        required : true,
        default : 0
    },
    checkin: {
        type : Number,
        required : true,
        default : 0
    },

    
    hotel : { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
   
}
)

//Creamos un modelo para saber como se van a guardar o donde se van a guardar los datos en la db
export default mongoose.model("Habitacion", habitacionSchema)
