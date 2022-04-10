const socket = io()

// sever (emit) -> client (receive) -- acknowledgment (אישור) --> server

// client (emit) -> sever (receive) -- acknowledgment --> client

// Elements
const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button') 

const sendLocationButton = document.querySelector('#send-location') 
const messages = document.querySelector('#messages') 

// Templates 
const messageTemplate =  document.querySelector('#message-template').innerHTML
const locationTemplate =  document.querySelector('#location-template').innerHTML
const sidebarTemplate =  document.querySelector('#sidebar-template').innerHTML


// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
  const newMessage = messages.lastElementChild
  const newMessageStyles = getComputedStyle(newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  // get the height of the new message
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = messages.offsetHeight

  // Height of messages container
  const containerHeight = messages.scrollHeight

  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight

  // check if we in the bottom and just then scroll
  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight
  }
}

socket.on('message', (message) => {
  console.log(message)
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('HH:mm:ss a')
  })
  messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', (locationMessage) => {
  console.log(locationMessage)
  const html = Mustache.render(locationTemplate, {
    username: locationMessage.username,
    url: locationMessage.url,
    createdAt: moment(locationMessage.createdAt).format('HH:mm:ss a')
  })
  messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })

  document.querySelector('#sidebar').innerHTML = html
})

messageForm.addEventListener('submit', (e)=> {
  e.preventDefault()
  // disable form button
  messageFormButton.setAttribute('disabled', 'disabled')

  // const message = document.querySelector('input').value
  const message = e.target.elements.message.value
  socket.emit('sendMessage', message, (acknowledgment_error) => {
    // enable form button after message have been sent
    messageFormButton.removeAttribute('disabled')
    messageFormInput.value = ''
    messageFormInput.focus()

    if (acknowledgment_error) {
      alert(acknowledgment_error)
      return console.log('The message from server is :', acknowledgment_error)
    }

    console.log('The message from server is delivered!')
  })
})

sendLocationButton.addEventListener('click', ()=> {

  if (!navigator.geolocation) {
    return alert('geolocation is not supported by your browser')
  }

  // disable location button
  sendLocationButton.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition( (position)=>{
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    } 

    socket.emit('sendLocation', location, () => {
      console.log('Location shared!')
      // enable location button
      sendLocationButton.removeAttribute('disabled')
    })
  })
})

socket.emit('join', {username, room}, (error)=> {
  if (error) {
    alert(error)
    location.href = '/'
  }
})

// socket.on('countUpdated', (count) => {
//   console.log(`the count has benn updated! ${count}`)
// })

// document.getElementById("increment").addEventListener('click', ()=> {
//   console.log('clicked')
//   socket.emit('increment')
// })

