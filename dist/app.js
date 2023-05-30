"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const Filter = require('bad-words');
const socketio = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = socketio(server);
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.get('/', (req, res, next) => {
    res.render('../public/index.html');
});
io.on('connection', (socket) => {
    // sends a message for the client connection
    socket.emit('message', 'Welcome!');
    // sends a message for all clients except the one triggered it 
    socket.broadcast.emit('message', 'a new user has joined');
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }
        else {
            //sends the message for all clients
            io.emit('message', message);
            callback();
        }
    });
    socket.on('sendLocation', (position, callback) => {
        io.emit('location', `https://google.com/maps/?q=${position.latitude},${position.longitude}`);
        callback();
    });
    socket.on('disconnect', () => {
        io.emit('message', ' a user has left');
    });
    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
    });
});
server.listen(process.env.PORT, () => {
    console.log(process.env.PORT);
});
