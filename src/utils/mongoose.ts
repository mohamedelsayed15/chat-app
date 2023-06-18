const mongoose = require('mongoose')


require('dotenv').config()

mongoose.connect(process.env.MONGODB_CONNECTION)
    .then(() => {
        console.log("connected")
    }).catch((error: Error) => {
        console.log(error)
    })
