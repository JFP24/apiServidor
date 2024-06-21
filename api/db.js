// import mongoose from 'mongoose';

// // La conexión a la base de datos es asíncrona
// export const connectDb = async () => {
//     try {
//         await mongoose.connect("mongodb+srv://diseven:igGp20a5vyFODXgL@dimaster.6hh65sk.mongodb.net/tuNombreBD?retryWrites=true&w=majority", 
//         );
//         console.log(">>> DB IS CONNECTED");
//     } catch (error) {
//         console.log("Error connecting to the database", error);
//     }
// }

 import mongoose from "mongoose";
//La conexion a la base de datos es asincrona
export const connectDb = async ()=> {
try {
    await mongoose.connect("mongodb://127.0.0.1:27017/dimaster")
    console.log(">>> DB IS CONNECTED")
} catch (error) {
    console.log(error)
}
}