const socket = io()

const $messageForm = document.getElementById('message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormSendLocation = $messageForm.querySelector('#send-location')
const $messageFormSendMessage = $messageForm.querySelector('#send-message')
const $messages = document.getElementById('messages')

// templates
const messagesTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML



socket.on('location', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, { location })
    $messages.insertAdjacentHTML('beforeend', html)

})

socket.on('message', (message) => {
    console.log(message)

    const html = Mustache.render(messagesTemplate, { message })
    $messages.insertAdjacentHTML('beforeend',html)
})


$messageForm.addEventListener('submit', (e) => {

    e.preventDefault()

    $messageFormSendMessage.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {

        $messageFormSendMessage.removeAttribute('disabled')
        $messageFormInput.value = ''
        //moves the cursor inside the form
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log("delivered")
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