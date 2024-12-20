import express from 'express'
import bodyParser from "body-parser"
import { Server } from "socket.io"

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})
const app = express()

app.use(bodyParser.json())

const emailToSocketMapping = new Map();

io.on('connection', (socket) => {
  console.log('User connected')
  socket.on("join-room", ({ roomId, emailId }) => {
    console.log(`User with email ${emailId} joined to room ${roomId}`)
    emailToSocketMapping.set(emailId, socket.id)
    socket.join(roomId)
    socket.emit("joined-room", { roomId })
    socket.broadcast.to(roomId).emit("user-joined", emailId)
  })
})

app.listen(8000, () => {
  console.log('Server is running on port 8000')
})
io.listen(8001)