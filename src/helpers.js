module.exports = {
    getChatId(msg){
        return msg.chat.id;
    },
    debug(obj={}){
        return JSON.stringify(obj, null, 4)
     },
    getPhoneNumber(phone){
        return phone.slice(phone.length - 5)
    }
}