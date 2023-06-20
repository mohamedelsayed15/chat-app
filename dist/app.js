"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const room_route_1 = __importDefault(require("./routes/room.route"));
const auth_1 = require("./middleware/auth");
const user_model_1 = require("./models/user.model");
const oneToOneChat_model_1 = __importDefault(require("./models/oneToOneChat.model"));
require('dotenv').config();
require('./utils/mongoose');
const { generateMessage } = require('./utils/messages');
const Filter = require('bad-words');
const socketio = require("socket.io");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const server = http_1.default.createServer(app);
const io = socketio(server);
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use('/auth', auth_route_1.default);
app.use('/user', user_route_1.default);
app.use('/room', room_route_1.default);
app.get('/', (req, res, next) => {
    res.render('../public/index.html');
});
// sends a message for the client connection
//socket.emit('message',generateMessage('Welcome!'))
// sends a message for all clients except the one triggered it 
//socket.broadcast.emit('message', generateMessage('a new user has joined'))
io.on('connection', (socket) => {
    console.log("a connection");
    socket.on('join', (data, callback) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // validation
            if (!data.token) {
                return socket.disconnect();
            }
            const { token } = data;
            const decoded = yield (0, auth_1.jwtVerify)(token);
            const user = yield user_model_1.User.findById(decoded._id);
            if (!user || user.contacts.length === 0) {
                return;
            }
            for (let i = 0; i < user.contacts.length; i++) {
                socket.join(user.contacts[i].roomId.toString());
            }
            return callback && callback();
        }
        catch (e) {
            console.log(e);
            socket.disconnect();
        }
    }));
    socket.on('sendMessage', (message, callback) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // validation
            if (!message.token || !message.roomId || !message.text) {
                console.log(1);
                return socket.disconnect();
            }
            const { token, roomId, text } = message;
            const decoded = yield (0, auth_1.jwtVerify)(token);
            const [user, room] = yield Promise.all([
                user_model_1.User.findById(decoded._id),
                oneToOneChat_model_1.default.findById(roomId)
            ]);
            if (!user || !room) {
                return socket.disconnect();
            }
            if (room.userOne.toString() !== decoded._id
                && room.userTwo.toString() !== decoded._id) {
                return socket.disconnect();
            }
            const filter = new Filter();
            if (filter.isProfane(message.text)) {
                return callback('Profanity is not allowed');
            }
            else {
                // function from utils directory
                const generatedMessage = generateMessage(text, user.name);
                room.messages.push(generatedMessage);
                yield room.save();
                //sends the message for all clients
                io.to(room._id.toString()).emit('message', generatedMessage);
                return callback && callback();
            }
        }
        catch (e) {
            console.log(e);
            socket.disconnect();
        }
    }));
    socket.on('disconnect', () => {
        console.log("a disconnection");
    });
    socket.on("error", (err) => {
        if (err && err.message === "unauthorized event") {
            socket.disconnect();
        }
        console.log(err);
    });
    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
    });
    socket.on("error", (err) => {
        if (err && err.message === "unauthorized event") {
            socket.disconnect();
        }
    });
});
server.listen(process.env.PORT, () => {
    console.log(process.env.PORT);
});
