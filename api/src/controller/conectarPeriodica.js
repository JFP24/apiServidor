import mongoose from 'mongoose';
import Habitacion from '../models/habitaciones.models.js';
import Respuesta from '../models/respuesta.models.js';
import Hotel from "../models/hotel.models.js";
import mqtt from 'mqtt';
import { io } from '../../app.js'; // Importa la instancia de io desde app.js

// Cola en memoria
const messageQueue = [];
let isProcessing = false;

// Función para procesar la cola
const processQueue = async () => {
    if (isProcessing || messageQueue.length === 0) {
        return;
    }

    isProcessing = true;

    const { topic, message } = messageQueue.shift(); // Extrae el primer mensaje de la cola

    try {
        const messageJSON = JSON.parse(message.toString());
        console.log("Mensaje recibido:", messageJSON.data[0].value);
        const mensaje = messageJSON.data[0].value;

        const { ID, Eventos } = mensaje;

        if (Eventos && Array.isArray(Eventos)) {
            const eventosValidos = Eventos.filter(evento => {
                if (evento.Hab && evento.Hotel && evento.NameEvent && evento.value && evento.fecha && evento.hora) {
                    return true;
                } else {
                    console.warn(`Evento inválido: ${JSON.stringify(evento)}`);
                    return false;
                }
            }).map(evento => ({
                nameEvent: evento.NameEvent,
                value: evento.value,
                fecha: new Date(evento.fecha), // Asegura que la fecha sea del tipo Date
                hora: evento.hora,
                hotel: evento.Hotel,
                numeroHabitacion: evento.Hab // Mantén este campo para la creación de la habitación
            }));

            console.log('Eventos válidos:', eventosValidos);

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                let respuesta = await Respuesta.findOneAndUpdate(
                    { dimasterID: ID },
                    { $push: { eventos: { $each: eventosValidos } } },
                    { new: true, upsert: true, session }
                );

                for (let evento of eventosValidos) {
                    if (['lavanderia', 'checkin', 'puerta', 'houseKeeping', 'estado', 'noMolestar', 'miniBar'].includes(evento.nameEvent)) {
                        let habitacion = await Habitacion.findOneAndUpdate(
                            { habitacionID: ID },
                            { $set: { [evento.nameEvent]: evento.value } },
                            { new: true, upsert: true, session }
                        );

                        console.log(evento.value);

                        io.emit('estado', { habitacionID: habitacion.habitacionID, valor: habitacion.estado });
                        io.emit('updateLavanderia', { habitacionID: habitacion.habitacionID, valor: habitacion.lavanderia });
                        io.emit('updateNoMolestar', { habitacionID: habitacion.habitacionID, valor: habitacion.noMolestar });
                        io.emit('puerta', { habitacionID: habitacion.habitacionID, valor: habitacion.puerta });
                        io.emit('housekeeping', { habitacionID: habitacion.habitacionID, valor: habitacion.houseKeeping });
                        io.emit('checkin', { habitacionID: habitacion.habitacionID, valor: habitacion.checkin });
                        io.emit('miniBar', { habitacionID: habitacion.habitacionID, valor: habitacion.miniBar });

                        let hotel = await Hotel.findOneAndUpdate(
                            { nombre: evento.hotel },
                            { $addToSet: { habitaciones: habitacion._id } },
                            { new: true, session }
                        );
                        console.log(`Habitación agregada al hotel: ${hotel.nombre}`);
                    }
                }

                await session.commitTransaction();
                session.endSession();

            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                console.error('Error al guardar los datos en MongoDB:', error);
            }

            io.emit('mqtt-message', messageJSON);
        } else {
            console.error('El campo "Eventos" no es un array o no está definido:', Eventos);
        }
    } catch (error) {
        console.error('Error al procesar el mensaje MQTT:', error);
    }

    isProcessing = false;
    processQueue(); // Procesa el siguiente mensaje en la cola
};

// Función que conecta al tópico y filtra la información para la base de datos
export const connectAndFetchData = () => {

const mqttOptions = {
    host: "diseven7.disevenapp.com",
    port: 1884,
    // username: 'UserdataHoteles',
    // password: 'passdataHotelesd1s3v3n777',
    username: '00000000c0029b4db6adadmin',
    password: '00000000c0029b4db6adadmin',
 };
    const topic = "dataHoteles";
    const client = mqtt.connect(mqttOptions);

    client.on('connect', () => {
        console.log("Conexión MQTT exitosa para dimaster");
        client.subscribe(`${topic}/h`, (err) => {
            if (err) {
                console.error('Error al suscribirse:', err);
                client.end();
            } else {
                console.log('Suscripción exitosa al tópico:', topic);
            }
        });
    });

    client.on('message', (topic, message) => {
        console.log(`Mensaje recibido en el tópico ${topic}`);
        messageQueue.push({ topic, message });
        processQueue();
    });

    client.on('error', (err) => {
        console.error('Error en la conexión MQTT:', err);
        client.end();
    });
};





// const mqttOptions = {
//     host: "diseven7.disevenapp.com",
//     port: 1884,
//     // username: 'UserdataHoteles',
//     // password: 'passdataHotelesd1s3v3n777',
//     username: '00000000c0029b4db6adadmin',
//     password: '00000000c0029b4db6adadmin',
// // };