//TELEGRAM
const TelegramBot = require('node-telegram-bot-api');
//polling
const telegram_bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});
console.log(process.env.TELEGRAM_TOKEN)
//webhook
/*const url = 'https://18c8cca0740c.ngrok.io/posts';
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);
bot.setWebHook(`${url}/bot${process.env.TELEGRAM_TOKEN}`);
// We are receiving updates at the route below!
router.post(`/bot${process.env.TELEGRAM_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});*/
//webhook

//VIBER
const ViberBot = require('viber-bot').Bot;
const viber_bot = new ViberBot({
    authToken: process.env.VIBER_TOKEN,
    name: "UaTaoBot",
    avatar: "http://viber.com/avatar.jpg"
});

viber_bot.setWebhook(process.env.VIBER_WEBHOOK)
    .then(() => console.log('VIBER - set webhook'))
    .catch(err => console.log(err));

//export telegram & viber bots
module.exports = { telegram_bot, viber_bot }