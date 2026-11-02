const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

let players = {};

io.on('connection', (socket) => {
    console.log('Phật tử kết nối:', socket.id);

    // Khi có người vào chánh điện
    socket.on('joinTemple', (data) => {
        players[socket.id] = {
            id: socket.id,
            name: data.name,
            color: data.color,
            x: data.x || 0,
            z: data.z || 4,
            rotY: 0
        };
        socket.emit('currentPlayers', players);
        socket.broadcast.emit('playerJoined', players[socket.id]);
    });

    // Đồng bộ di chuyển
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].z = data.z;
            players[socket.id].rotY = data.rotY;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    // Đồng bộ Chat / Lời khấn
    socket.on('chatMessage', (msg) => {
        io.emit('chatMessage', { id: socket.id, text: msg });
    });

    // Đồng bộ Hành động (Gõ mõ, Thỉnh chuông, Thắp hương)
    socket.on('action', (actionType) => {
        socket.broadcast.emit('playerAction', { id: socket.id, action: actionType });
    });

    // Khi người chơi thoát phòng
    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerLeft', socket.id);
        console.log('Phật tử rời phòng:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});