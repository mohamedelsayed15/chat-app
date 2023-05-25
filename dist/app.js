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
let count = 0;
io.on('connection', (socket) => {
    console.log('new connection');
    socket.emit('countUpdated', count);
    socket.on('increment', () => {
        count++;
        socket.emit('countUpdated', count);
        io.emit('countUpdated', count);
    });
});
app.get('/', (req, res, next) => {
    res.render('../public/index.html');
});
server.listen(process.env.PORT, () => {
    console.log(process.env.PORT);
});
