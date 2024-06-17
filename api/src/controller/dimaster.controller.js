import Habitacion from '../models/habitaciones.models.js';
import mqtt from 'mqtt';
import { io } from '../../app.js';
import jwt from "jsonwebtoken";
import Hotel from "../models/hotel.models.js";
import Respuestas from "../models/respuesta.models.js";

let client = null;
let mqttSubscribed = false;

export const conectarMqtt = async (req, res) => {
    if (client) {
        return res.status(400).send("La conexión MQTT externa ya está establecida");
    }

    const { id } = req.params;
    const dimasterId = await Habitacion.findById(id);
    console.log(dimasterId);
    if (!dimasterId) return res.status(400).send("Este dimaster no existe en la base de datos");

    const mqttOptions = {
       host: "diseven7.ddns.net",
       //host : "diseven7v2.disevenapp.com",
        port: 1884,
        username: `${dimasterId.topicExterno}admin`,
        password: `${dimasterId.topicExterno}admin`
       // username: `UserdataHoteles`,
      //  password: `passdataHotelesd1s3v3n777`,
    };
   const topic = `${dimasterId.topicExterno}`;
    //const topic = "dataHoteles"
    client = mqtt.connect(mqttOptions);

    client.on('connect', () => {
        console.log(`Conexión MQTT exitosa para dimaster: ${dimasterId.numeroHabitacion}`);
        if (!mqttSubscribed) {
            client.subscribe(`${topic}/a`, (err) => {
                if (err) {
                    console.error('Error al suscribirse:', err);
                    client.end();
                } else {
                    console.log('Suscripción exitosa al tópico:', topic);
                    client.publish(`${topic}/d`, JSON.stringify({
                        destiny: "dim",
                        source: "app",
                        data: [{
                            type: "conf",
                            value: "DIS%",
                            value2: 'DISE'
                        }]
                    }));
                    mqttSubscribed = true;
                }
            });
        }
    });

    client.on('message', async (topic, message) => {
        const messageJSON = JSON.parse(message.toString());
        const value2 = messageJSON.data[0].value;
        console.log(value2, "this is the value");

        io.emit('mqttData', value2);

        // // Procesar y actualizar el estado de lavandería
        if (value2.includes('n121') || value2.includes('ff121')) {
            const lavanderia = value2.includes('n121') ? 1 : 0;
            await Habitacion.findByIdAndUpdate(id, { lavanderia });
            console.log(`Lavandería para la habitación ${dimasterId.numeroHabitacion} actualizada a ${lavanderia}`);

            // Emitir evento de actualización
            io.emit('updateLavanderia', { id: dimasterId._id, lavanderia });
        }
        if (value2.includes('n122') || value2.includes('ff122')) {
            const houseKeeping = value2.includes('n122') ? 1 : 0;
            await Habitacion.findByIdAndUpdate(id, { houseKeeping });
            console.log(`noAseo para la habitación ${dimasterId.numeroHabitacion} actualizada a ${houseKeeping}`);

            // Emitir evento de actualización
            io.emit('updateNoAseo', { id: dimasterId._id, houseKeeping });
        }
        if (value2.includes('n123') || value2.includes('ff123')) {
            const noMolestar = value2.includes('n123') ? 1 : 0;
            await Habitacion.findByIdAndUpdate(id, { noMolestar });
            console.log(`noMolestar para la habitación ${dimasterId.numeroHabitacion} actualizada a ${noMolestar}`);

            // Emitir evento de actualización
            io.emit('updateNoMolestar', { id: dimasterId._id, noMolestar });
        }
    });

    return res.status(200).send("Conexión MQTT externa exitosa");
};



export const desconectarMqtt = async (req, res) => {
    if (!client) {
        return res.status(400).send("No hay conexión MQTT establecida para desconectar");
    }

    client.end();
    client = null;
    mqttSubscribed = false;

    return res.status(200).send("Desconexión externa MQTT exitosa");
};

export const mensajeMQTT = async (req, res) => {
    if (!client) {
        return res.status(400).send("No hay conexión MQTT establecida para enviar mensajes");
    }

    const { id } = req.params;
    const { mensaje } = req.body;

    if (!mensaje) {
        return res.status(400).json({ error: 'Se requiere el campo "mensaje".' });
    }

    const dimasterId = await Habitacion.findById(id);
    if (!dimasterId) return res.status(400).send("Este dimaster no existe en la base de datos");
    const topic = `${dimasterId.topicExterno}`;
    //const topic = "dataHoteles"
    const mensajeString = JSON.stringify(mensaje);
    const mensajeFinal = mensajeString.replace(/^"|"$/g, '');
    const envio = mensajeFinal.replace(/\\/g, '');
    console.log(envio);

    client.publish(`${topic}/d`, JSON.stringify({
        destiny: "dim",
        source: "app",
        data: [{
            type: "conf",
            value: envio,
            value2: 'DISE'
        }]
    }));

    return res.status(200).send("Mensaje enviado con éxito");
};

export const datos = async (req, res) => {
    try {
        // Obtener todas las respuestas de la base de datos
        const respuestas = await Respuestas.find();

        // Organizar los datos por hotel y dimaster
        const hotelData = {};
        respuestas.forEach(respuesta => {
            const { hotel, dimaster, values } = respuesta;

            if (!hotelData[hotel]) {
                hotelData[hotel] = {};
            }
            if (!hotelData[hotel][dimaster]) {
                hotelData[hotel][dimaster] = [];
            }

            // Agregar los valores al hotelData
            values.forEach(({ value, timestamp }) => {
                hotelData[hotel][dimaster].push({ value, timestamp });
            });
        });

        // Enviar los datos organizados como respuesta
        res.json(hotelData);
    } catch (error) {
        console.error('Error al obtener y procesar los datos:', error);
        res.status(500).json({ error: 'Error al obtener y procesar los datos' });
    }
};
