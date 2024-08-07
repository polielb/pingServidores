const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.json());

// Objeto para almacenar el estado de los pings
const statusMap = {};

// Ruta para recibir las solicitudes curl
app.post('/update_status', (req, res) => {
    const { serverIp, pingIp, success } = req.body;
    console.log(`Solicitud POST recibida: serverIp=${serverIp}, pingIp=${pingIp}, success=${success}`);
    statusMap[serverIp] = statusMap[serverIp] || {};
    statusMap[serverIp][pingIp] = success ? 'green' : 'red';
    console.log(`Estado actualizado para ${serverIp} -> ${pingIp}: ${success ? 'green' : 'red'}`);
    res.sendStatus(200);
});

// Ruta para obtener el estado actual como un flujo de eventos
app.get('/status', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    // Envía el estado actual en un bucle cada 5 segundos
    res.write(`data: ${JSON.stringify(statusMap)}\n\n`);

    // Manejo del cierre de la conexión
    req.on('close', () => {
        res.end();
    });
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

// Servidor escuchando en el puerto 3000
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});


