"use strict";
exports.generateMessage = (text, username) => {
    return {
        text,
        username,
        createdAt: new Date().getTime()
    };
};
