"use strict";
exports.generateMessage = (text, username) => {
    return {
        message: text,
        createdBy: username,
        createdAt: new Date().getTime()
    };
};
