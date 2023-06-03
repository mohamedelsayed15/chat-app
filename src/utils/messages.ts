exports.generateMessage = (text:string) => {
    return {
        text,
        createdAt:new Date().getTime()
    }
}