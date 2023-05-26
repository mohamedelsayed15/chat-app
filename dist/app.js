"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socketio = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = socketio(server);
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
io.on('connection', (socket) => {
    // sends a message for the client connection
    socket.emit('message', 'Welcome!');
    // sends a message for all clients except the one triggered it 
    socket.broadcast.emit('message', 'a new user has joined');
    socket.on('sendMessage', (message) => {
        //sends the message for all clients
        io.emit('message', message);
    });
    socket.on('disconnect', () => {
        io.emit('message', ' a user has left');
    });
});
app.get('/', (req, res, next) => {
    res.render('../public/index.html');
});
server.listen(process.env.PORT, () => {
    console.log(process.env.PORT);
});
