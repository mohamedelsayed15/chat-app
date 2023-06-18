"use strict";
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_CONNECTION)
    .then(() => {
    console.log("connected");
}).catch((error) => {
    console.log(error);
});
