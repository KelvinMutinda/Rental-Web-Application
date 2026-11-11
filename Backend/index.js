const express = require('express')
const cors = require('cors')
const http = require('http')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { Server } = require('socket.io')

require('dotenv').config()

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.json())

// Realtime: only admins can connect, and they join the "admins" room
const io = new Server(server, { cors: { origin: '*' } })
io.use((socket, next) => {
  try {
    const user = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET)
    if (user.role !== 'admin') return next(new Error('Admins only'))
    socket.user = user
    next()
  } catch (err) {
    next(new Error('Unauthorized'))
  }
})
io.on('connection', (socket) => socket.join('admins'))

// Routes can reach the notifier with req.app.get('notifyAdmins')
app.set('io', io)
app.set('notifyAdmins', (event, payload = {}) => io.to('admins').emit(event, payload))

app.use('/api', require('./routes/routes'))
app.use('/api/tenant', require('./routes/tenant'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/mpesa', require('./routes/mpesa'))

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('Database connected successfully ✅'))
    .catch((error) => console.error('Database connection failed ❌', error))
} else {
  console.log('MongoDb uri is missing')
}

server.listen(PORT, () => {
  console.log(`Backend connected running on port ${PORT}`)
})