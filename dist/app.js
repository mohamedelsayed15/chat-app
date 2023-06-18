"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
require('dotenv').config();
const User = require('./utils/users.js');
const { generateMessage } = require('./utils/messages');
const Filter = require('bad-words');
const socketio = require("socket.io");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const server = http_1.default.createServer(app);
const io = socketio(server);
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.get('/', (req, res, next) => {
    res.render('../public/index.html');
});
let currentRoom;
io.on('connection', (socket) => {
    console.log("a connection");
    // join
    //could only be used on the server
    socket.on('join', (data, callback) => {
        try {
            if (!data.username || !data.room) {
                return socket.disconnect();
            }
            const { username, room } = data;
            console.log("joined room " + room);
            const { error, user } = User.addUser({ id: socket.id, username, room });
            if (error) {
                console.log(error);
                //return callback && callback(error)
            }
            socket.join(user.room);
            //sending welcome message to user only has nothing to do with rooms 
            socket.emit('message', generateMessage(`Welcome ${user.username}`, user.username));
            // broadcasting a user has joined doesn't appear to user triggered it
            socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`, user.username));
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: User.getUsersInRoom(user.room)
            });
            /*emit for users in room except the user triggered action
            socket.broadcast.to(room).emit
    
            emit for users in a certain room
            socket.to(room).emit*/
        }
        catch (e) {
            console.log(e);
        }
    });
    socket.on('sendMessage', (message, callback) => {
        if (!message.text) {
            return socket.disconnect();
        }
        console.log(socket.id);
        const text = message.text;
        const user = User.findUser(socket.id);
        console.log(user);
        if (!user) {
            return socket.disconnect();
        }
        const filter = new Filter();
        if (filter.isProfane(text)) {
            return callback('Profanity is not allowed');
        }
        else {
            //sends the message for all clients
            io.to(user.room).emit('message', generateMessage(text, user.username));
            return callback && callback();
        }
    });
    socket.on('sendLocation', (position, callback) => {
        const user = User.findUser(socket.id);
        io.to(user.room).emit('location', generateMessage(`https://google.com/maps/?q=${position.latitude},${position.longitude}`, user.username));
        callback();
    });
    socket.on('disconnect', () => {
        console.log("a disconnection");
        const user = User.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: User.getUsersInRoom(user.room)
            });
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`));
        }
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
