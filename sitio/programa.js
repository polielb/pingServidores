const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.json());

// Objeto para almacenar el estado de los pings
const statusMap = {};
const lastPingTimeMap = {};

// Función para actualizar el estado de los pings y verificar inactividad
function updatePingStatus(serverIp, pingIp, success) {
    console.log(`Actualizando estado para ${serverIp} -> ${pingIp}: ${success ? 'green' : 'red'}`);
    statusMap[serverIp] = statusMap[serverIp] || {};
    statusMap[serverIp][pingIp] = success ? 'green' : 'red';
    lastPingTimeMap[serverIp] = Date.now();

    // Enviar el estado actual a todos los clientes WebSocket
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(statusMap));
        }
    });

    // Verificar inactividad después de 15 minutos
    setTimeout(() => {
        const lastPingTime = lastPingTimeMap[serverIp] || 0;
        if (Date.now() - lastPingTime > 1 * 60 * 1000) {
            console.log(`Inactividad detectada para ${serverIp}, cambiando a gris oscuro`);
            statusMap[serverIp] = statusMap[serverIp] || {};
            for (const ip in statusMap[serverIp]) {
                statusMap[serverIp][ip] = 'darkgrey'; // Cambia el color a gris oscuro
            }

            // Envía el estado actualizado a los clientes WebSocket
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(statusMap));
                }
            });
        }
    }, 1 * 60 * 1000);
}

// Ruta para recibir las solicitudes curl
app.post('/update_status', (req, res) => {
    const { serverIp, pingIp, success } = req.body;
    console.log(`Solicitud POST recibida: serverIp=${serverIp}, pingIp=${pingIp}, success=${success}`);
    updatePingStatus(serverIp, pingIp, success);
    res.sendStatus(200);
});

// Middleware para mostrar todas las solicitudes entrantes
app.use((req, res, next) => {
    console.log('Solicitud entrante:');
    console.log(`Método: ${req.method}`);
    console.log(`Ruta: ${req.url}`);
    console.log(`Cuerpo: ${JSON.stringify(req.body)}`);
    next();
});

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket para enviar el estado actual a los clientes
wss.on('connection', (ws) => {
    console.log('Cliente conectado');
    ws.send(JSON.stringify(statusMap));
});

// Servidor escuchando en el puerto 3000
server.listen(3000, () => {
    console.log(`Servidor escuchando en http://localhost:3000`);
});


