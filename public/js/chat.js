
const socket = io()

const $messageForm = document.getElementById('message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormSendLocation = $messageForm.querySelector('#send-location')
const $messageFormSendMessage = $messageForm.querySelector('#send-message')
const $messages = document.getElementById('messages')

// templates
const messagesTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarList = document.querySelector('#sidebar-template').innerHTML
//options 
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild

    // height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    // how far scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

socket.on('roomUsers', ({ room, users }) => {
    const html = Mustache.render(sidebarList, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('location', (location) => {

    const html = Mustache.render(locationTemplate, {
        username:location.username,
        location: location.text,
        createdAt: moment(location.createdAt).format('h:mm a')// 7:05 pm
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('message', (message) => {

    const html = Mustache.render(messagesTemplate, {
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')// 7:05 pm
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})


$messageForm.addEventListener('submit', (e) => {

    e.preventDefault()

    $messageFormSendMessage.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage',{text: message} , (error) => {

        $messageFormSendMessage.removeAttribute('disabled')
        $messageFormInput.value = ''
        //moves the cursor inside the form
        $messageFormInput.focus()

        if (error) {
            return alert(error)
        }

    })

})

$messageFormSendLocation
    .addEventListener('click', () => {
        if (!navigator.geolocation) {
            return alert('feature is not supported by your browser')
        }
        $messageFormSendLocation.setAttribute('disabled', 'disabled')

        navigator.geolocation.getCurrentPosition((position) => {
            socket.emit('sendLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, () => {
            $messageFormSendLocation.removeAttribute('disabled')
                console.log('sent')
            })

        })
    })