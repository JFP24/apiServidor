import Habitacion from '../models/habitaciones.models.js';
import Respuesta from '../models/respuesta.models.js';
import mqtt from 'mqtt';
import { io } from '../../app.js'; // Importa la instancia de io desde app.js


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
            const mensaje = messageJSON.data[0].value;

            console.log('Mensaje recibido:', mensaje);

            const { ID, Eventos } = mensaje;

            console.log('Eventos:', Eventos);

            if (Eventos && Array.isArray(Eventos)) {
                // Filtra y valida los eventos
                const eventosValidos = Eventos.filter(evento => {
                    if (evento.NameEvent && evento.value && evento.fecha && evento.hora) {
                        console.log(`Evento válido: ${JSON.stringify(evento)}`);
                        return true;
                    } else {
                        console.warn(`Evento inválido: ${JSON.stringify(evento)}`);
                        return false;
                    }
                }).map(evento => ({
                    nameEvent: evento.NameEvent, // Mapeando NameEvent a nameEvent
                    value: evento.value,
                    fecha: evento.fecha, // Guardar fecha tal como entra
                    hora: evento.hora
                }));

                console.log('Eventos válidos:', eventosValidos);

                try {
                    let respuesta = await Respuesta.findOne({ dimasterID: ID });
                    console.log('Respuesta encontrada:', respuesta);

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