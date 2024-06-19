import mongoose from 'mongoose';

const eventoSchema = new mongoose.Schema({
    nameEvent: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    fecha: {
        type: String, // Cambiado a tipo Date para manejar fechas de manera más eficiente
        required: true
    },
    hora: {
        type: String,
        required: true
    },

    
},{ _id: false },);

const respuestaSchema = new mongoose.Schema({
    dimasterID: {
        type: String,
        required: true,
        index: true // Índice para mejorar el rendimiento de las consultas
    },
    eventos: [eventoSchema] // Array de eventos
});

const Respuesta = mongoose.model('Respuesta', respuestaSchema);

export default Respuesta;
