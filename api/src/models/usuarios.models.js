import mongoose from "mongoose";
//Creamos el schema , un objeto con las propiedades que queremos validar en la DB de mongodb
const userSchema = new mongoose.Schema({
    username : {
        //tipo
        type :String,
       required: true,
        //sin espacios
        trim : true
    },
    email : {
        type : String,
        required : true,
        trim : true,
        unique:true

    },
    password : {
        type :String,
        required : true,
        trim : true

    },
    rol : {
        type : String,
       default: "usuario"
    },

    hotel : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }]
},
{
    timestamps:true
})

//Creamos un modelo para saber como se van a guardar o donde se van a guardar los datos en la db
export default mongoose.model("User", userSchema)