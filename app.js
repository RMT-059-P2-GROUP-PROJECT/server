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
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

io.on('connection', (socket) => {
    // console.log(socket.handshake.auth, "<<<< socket auth")
    console.log(socket.id, "connected")
    socket.on('disconnect', () => {
        console.log(socket.id, "disconnected")
    })

    // Handle joining group rooms
    socket.on('join_group', (groupId) => {
        socket.join(`group_${groupId}`);
        console.log(`user ${socket.id} joined group ${groupId}`);
    });

    io.emit('mySocketId', socket.id)
    io.emit('handShakeAuth', socket.handshake.auth)
})

app.set('io', io);
app.use('/', require('./routers/index'))

app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
    httpServer.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
} else {
    console.log(`Server is running in test mode`)
}

const closeServer = () => {
    if (httpServer) {
        httpServer.close();
    }
}

module.exports = { app, closeServer };