const path = require('path')
const http = require('http')
const { log } = require('console')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} =  require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} =  require('./utils/users')

const app = express()
// socketio need to get http server and not express server:
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 8000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.json());

app.use(express.static(publicDirectoryPath));

let count = 0

// sever (emit) -> client (receive) -countUpdated
// client (emit) -> sever (receive) -increment

io.on('connection', (socket) => {
  log('New web socket connection!!')

  socket.on('join', ({username, room}, callback) => {
    const {error, user} = addUser({ id: socket.id, username, room})

    if (error) {
      return callback(error)
    }

    socket.join(user.room)

    socket.emit('message', generateMessage('Admin', "Welcome!"))
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined !`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    callback()
  })

  // sendMessage event
  socket.on('sendMessage', (message, callback)=> {
    const user = getUser(socket.id)
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }

    io.to(user.room).emit( 'message', generateMessage(user.username, message) )
    callback()
  })

  // sendLocation event
  socket.on('sendLocation', ( {latitude, longitude}, callback)=> {
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage', generateLocationMessage(
      user.username, `https://google.com/maps?q=${latitude},${longitude}`) 
    )
    callback()
  })

  // disconnect event
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })

  // socket.emit('countUpdated', count)

  // socket.on('increment', () => {
  //   count++
  //   // socket.emit('countUpdated', count) - not good - emit an event just to a single connection/client in real time
  //   io.emit('countUpdated', count)
  // })
})

server.listen(port, ()=> {
  console.log(`App is listening on port ${port}!`)
})

// There are 5 kinds of emit:
// 1) socket.emit - emit an event to the current user
// 2) io.emit - emit an event to all users
// 3) socket.broadcast.emit - emit an event to all users except the current user

// 4) io.to.emit - emit an event to every user in a specific chat room
// 5) socket.broadcast.to.emit - emit an event to all users except the current user
//    in a specific chat room