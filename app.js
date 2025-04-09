if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const errorHandler = require('./middleware/errorHandler')
const cors = require('cors')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: "*"
})
app.set('io', io)
const port = 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

io.on('connection', (socket) => {
    // console.log(socket.handshake.auth, "<<<< socket auth")
    console.log(socket.id, "connected")
    socket.on('disconnect', () => {
        console.log(socket.id, "disconnected")
    })

    io.emit('mySocketId', socket.id)
    io.emit('handShakeAuth', socket.handshake.auth)

    // join room
    // Handle joining group rooms
    socket.on('join:group', (groupId) => {
        socket.join(`group_${groupId}`);
        console.log(`Socket ${socket.id} joined group ${groupId}`);
    });

    socket.on("chat:message:fetch", () => {
        io.emit("chat:message:create:response", messages)
    })
})

app.use('/', require('./routers/index'))

app.use(errorHandler)

httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})