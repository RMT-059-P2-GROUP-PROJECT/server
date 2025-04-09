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
const port = 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

io.on('connection', (socket) => {
    //...
    console.log(socket.handshake.auth, "<<<< socket auth")
    console.log(socket.id, "<<<< socket id")

    socket.emit("wellcome_message", "Welcome to socket server")
})

app.use('/', require('./routers/index'))

app.use(errorHandler)

httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})