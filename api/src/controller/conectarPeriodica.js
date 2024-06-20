import Habitacion from '../models/habitaciones.models.js';
import Respuesta from '../models/respuesta.models.js';
import Hotel from "../models/hotel.models.js";
import mqtt from 'mqtt';
import { io } from '../../app.js'; // Importa la instancia de io desde app.js

// Función que conecta al tópico y filtra la información para la base de datos
export const connectAndFetchData = () => {
    const mqttOptions = {
        host: "diseven7v2.disevenapp.com",
        port: 1884,
        username: 'UserdataHoteles',
        password: 'passdataHotelesd1s3v3n777'
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

    client.on('message', async (topic, message) => {
        try {
            const messageJSON = JSON.parse(message.toString());
            console.log(messageJSON.data[0].value);
            const mensaje = messageJSON.data[0].value;

            const { ID, Eventos } = mensaje;

            if (Eventos && Array.isArray(Eventos)) {
                // Filtra y valida los eventos
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
                        // Añadir nuevos eventos al array de eventos existente
                        respuesta.eventos = [...respuesta.eventos, ...eventosValidos];
                        await respuesta.save();
                        console.log('Respuesta actualizada:', respuesta);
                    } else {
                        // Crear un nuevo documento si no existe
                        const nuevaRespuesta = new Respuesta({
                            dimasterID: ID,
                            eventos: eventosValidos
                        });
                        await nuevaRespuesta.save();
                        console.log('Nueva respuesta creada:', nuevaRespuesta);
                    }

                    // Verificar y actualizar habitación si corresponde
                    for (let evento of eventosValidos) {
                        if (['lavanderia', 'checkin', 'puerta', 'housekeeping', 'estado', 'noMolestar'].includes(evento.nameEvent)) {
                            let habitacion = await Habitacion.findOne({ habitacionID: ID });

                            if (habitacion) {
                                // Actualizar la habitación existente
                                habitacion[evento.nameEvent] = evento.value;
                                await habitacion.save();
                                console.log('Habitación actualizada:', habitacion);
                                io.emit('estado', { habitacionID: habitacion.habitacionID, valor: habitacion.estado });
                                io.emit('updateLavanderia', { habitacionID: habitacion.habitacionID, valor: habitacion.lavanderia });
                                io.emit('updateNoMolestar', { habitacionID: habitacion.habitacionID, valor: habitacion.noMolestar });
                                io.emit('puerta', { habitacionID: habitacion.habitacionID, valor: habitacion.puerta });
                                io.emit('housekeeping', { habitacionID: habitacion.habitacionID, valor: habitacion.houseKeeping });
                                io.emit('checkin', { habitacionID: habitacion.habitacionID, valor: habitacion.checkin });
                            } else {
                                // Crear una nueva habitación si no existe
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

                // Emite el mensaje recibido a través de WebSockets
                io.emit('mqtt-message', messageJSON);
            } else {
                console.error('El campo "Eventos" no es un array o no está definido:', Eventos);
            }
        } catch (error) {
            console.error('Error al procesar el mensaje MQTT:', error);
        }
    });

    client.on('error', (err) => {
        console.error('Error en la conexión MQTT:', err);
        client.end();
    });
};
