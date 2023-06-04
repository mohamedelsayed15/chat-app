"use strict";
const users = [];
// addUser, removeUser, findUser, getUsersInRoom
exports.addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    console.log(username, room);
    //validation
    if (!username || !room) {
        return {
            error: 'name and room are required'
        };
    }
    // checking if user exists
    const existingUser = users.find(user => {
        return user.room === room && user.username === username;
    });
    if (existingUser) {
        return {
            error: 'name is in use'
        };
    }
    const user = { id, username, room };
    users.push(user);
    return { user };
};
exports.removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index > -1) {
        // removes certain elements in an array. 
        // takes (index: where to start, 1: number of elements u want to delete)
        return users.splice(index, 1)[0];
    }
};
// comparing integers is faster than comparing strings
// 
exports.findUser = (id) => {
    return users.find((user) => user.id === id);
};
exports.getUsersInRoom = (room) => {
    return users.filter(user => user.room === room);
};
