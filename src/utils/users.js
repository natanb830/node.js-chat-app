const users = []

const addUser = ({id, username, room}) => {
  // clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

   // validate the data
   if (!username || !room) {
     return {
       error: 'username and room are required!'
     }
   }

   // check for existing user in that room
   const existingUser = users.find(user => {
     return username === user.username && room === user.room
   })

   // validate username
   if (existingUser) {
     return {
       error: 'username is already in use in that room!'
     }
   }

   // store the user 
   const user = {id, username, room} 
   users.push(user)
   return {
     user
   }
}

const removeUser = (id) => {
  const index = users.findIndex(user => user.id === id)

  if (index !== -1) {
     return users.splice(index, 1)[0]
  }
}

const getUser = (id) => {
  const user = users.find(user => user.id === id)
  return user
}

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase()
  const users_in_room = users.filter(user => user.room === room)
  return users_in_room
}

addUser({
  id: 22,
  username: '  Nathan   ',
  room: '   machon lev   '
})

addUser({
  id: 22,
  username: 'max   ',
  room: ' machon lev   '
})

addUser({
  id: 34,
  username: ' John ',
  room: '  miluim '
})

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}


