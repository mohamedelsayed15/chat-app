import express from "express"
import path from 'path'
import http from 'http'

const socketio = require("socket.io")

const app = express()

const server = http.createServer(app)

const io = socketio(server);

app.use(express.static(path.join(__dirname, '../public')))

let count = 0

io.on('connection', (socket: any) => {
    console.log('new connection')
    socket.emit('countUpdated', count)

    socket.on('increment', () => {
        count ++
        socket.emit('countUpdated', count)
        io.emit('countUpdated', count)

    })

})

app.get('/', (req, res, next) => {
    res.render('../public/index.html')
})

server.listen(process.env.PORT, () => {
    console.log(process.env.PORT)
})