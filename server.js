require('dotenv').config({silent: true});

const path = require('path');
const fastify = require('fastify')();
const io = require('socket.io')(fastify.server);

fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'src'),
});

io.on('connection', function (socket) {
    console.log('Client init.');
    socket.emit('initialized', { 
        username: 'username',
        player: { level: 1, experience: 600, currentExperience: 0, nextLevelExperience: 1000 },
        storage: { creatures: 250, items: 350 },
        pos: { lat: 48.856583, lng: 2.317085 },
    });

    socket.on('inventory_list', () => {
        console.log('Sending inventory.');
        socket.emit('inventory_list', [
            { type: 1, count: 5, removable: true },
            { type: 2, count: 5, removable: true },
            { type: 3, count: 5, display: 'SUPER_VISION', fulltype: 'SUPER_VISION' },
            { type: 4, count: 5, display: 'INCENSE', fulltype: 'SUPER_VISION' },
        ]);
    });
});

fastify.listen(8080, '0.0.0.0', () => {
    let addr = fastify.server.address();
    console.log('Server listening at ', addr.address + ':' + addr.port);
    console.log(`Fake data at http://localhost:${addr.port}/?websocket=http://localhost:8080`);
});
