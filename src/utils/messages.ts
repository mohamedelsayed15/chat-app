exports.generateMessage = (text: string, username: string) => {
    return {
        message:text,
        createdBy:username,
        createdAt:new Date().getTime()
    }
}