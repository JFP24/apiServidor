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