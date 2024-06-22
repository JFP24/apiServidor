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
        console.log(messageJSON.data[0].value);
        const mensaje = messageJSON.data[0].value;

        const { ID, Eventos } = mensaje;

        if (Eventos && Array.isArray(Eventos)) {
            const eventosValidos = Eventos.filter(evento => {
                if (evento.NameEvent && evento.value && evento.fecha && evento.hora && evento.Hab) {
                    return true;
                } else {
                    console.warn(`Evento inválido: ${JSON.stringify(evento)}`);
                    return false;
                }
            }).map(evento => ({
                nameEvent: evento.NameEvent,
                value: evento.value,
                fecha: evento.fecha,
                hora: evento.hora,
                hotel: evento.Hotel,
                numeroHabitacion: evento.Hab // Mantén este campo para la creación de la habitación
            }));

            console.log('Eventos válidos:', eventosValidos);

            try {
                let respuesta = await Respuesta.findOne({ dimasterID: ID });

                if (respuesta) {
                    respuesta.eventos = [...respuesta.eventos, ...eventosValidos];
                    await respuesta.save();
                    //console.log('Respuesta actualizada:', respuesta);
                } else {
                    const nuevaRespuesta = new Respuesta({
                        dimasterID: ID,
                        eventos: eventosValidos
                    });
                    await nuevaRespuesta.save();
                    console.log('Nueva respuesta creada:', nuevaRespuesta);
                }

                for (let evento of eventosValidos) {
                    if (['lavanderia', 'checkin', 'puerta', 'houseKeeping', 'estado', 'noMolestar', 'miniBar'].includes(evento.nameEvent)) {
                        let habitacion = await Habitacion.findOne({ habitacionID: ID });
                    
                        if (habitacion) {
                            habitacion[evento.nameEvent] = evento.value;
                            console.log(evento.value);
                            await habitacion.save();
                            console.log('Habitación actualizada:', habitacion);
                            io.emit('estado', { habitacionID: habitacion.habitacionID, valor: habitacion.estado });
                            io.emit('updateLavanderia', { habitacionID: habitacion.habitacionID, valor: habitacion.lavanderia });
                            io.emit('updateNoMolestar', { habitacionID: habitacion.habitacionID, valor: habitacion.noMolestar });
                            io.emit('puerta', { habitacionID: habitacion.habitacionID, valor: habitacion.puerta });
                            io.emit('housekeeping', { habitacionID: habitacion.habitacionID, valor: habitacion.houseKeeping });
                            io.emit('checkin', { habitacionID: habitacion.habitacionID, valor: habitacion.checkin });
                            io.emit('miniBar', { habitacionID: habitacion.habitacionID, valor: habitacion.miniBar });
                        } else {
                            habitacion = new Habitacion({
                                habitacionID: ID,
                                numeroHabitacion: evento.numeroHabitacion,
                                [`${evento.nameEvent}`]: evento.value
                            });
                            await habitacion.save();
                            console.log('Nueva habitación creada:', habitacion);

                            let hotel = await Hotel.findOne({ nombre: evento.hotel });
                            if (hotel) {
                                hotel.habitaciones.push(habitacion._id);
                                await hotel.save();
                                console.log(`Habitación agregada al hotel: ${hotel.nombre}`);
                            }
                        }
                    }
                }
            } catch (error) {
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
