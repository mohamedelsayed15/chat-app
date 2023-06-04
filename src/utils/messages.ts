exports.generateMessage = (text: string, username: string) => {
    return {
        text,
        username,
        createdAt:new Date().getTime()
    }
}