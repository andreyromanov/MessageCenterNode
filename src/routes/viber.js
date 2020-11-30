const express = require('express');
const router = express.Router();

const bot = require('../bots').viber_bot
const BotEvents = require('viber-bot').Events;
const TextMessage = require('viber-bot').Message.Text;
const KeyboardMessage = require('viber-bot').Message.Keyboard;
const UrlMessage = require('viber-bot').Message.Url;

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host : process.env.HOST,
        user : process.env.db_USER,
        password : process.env.PASS,
        database : process.env.DB
    }
});
const keyboard = require('../keyboard')

const axios = require('axios');

/*bot.on(BotEvents.CONVERSATION_STARTED, (response) => {
    /!*bot.getUserDetails(response.userProfile)
        .then(userDetails => console.log(userDetails))
        .catch(err => console.log(err));*!/
})*/

router.post('/cms-notification', async (req,res) => {

    //const messages = JSON.parse(req.body.data);

    /*if(myCache.has( "users" )){
        users = myCache.get( "users" )
    } else{
        users = await knex.select().table('telegram_users')
            .then(rows => {
                myCache.set( "users", rows, 60*60*24 )
                return rows;
            }).catch( err => console.log(err) );

    }*/

    console.log('viber', req.body)

    /*messages.forEach(function(msg){

        queue.request((retry) => bot.sendMessage(msg.dialog, msg.text)
            .catch(error => {
                if (error.response.status === 429) { // We've got 429 - too many requests
                    return retry(error.response.data.parameters.retry_after) // usually 300 seconds
                }
                throw error; // throw error further
            }), msg.dialog, 'broadcast');

    });*/

    res.send('broadcasted')
});

const SAMPLE_KEYBOARD = {
    "Type": "keyboard",
    "Revision": 1,
    "Buttons": keyboard.viber_home_btns

};

const CONTACT_KEYBOARD = {
    "Type": "keyboard",
    "Revision": 1,
    "Buttons": [
        {
            "Columns": 6,
            "Rows": 1,
            "BgColor": "#2db9d3",
            "BgLoop": true,
            "ActionType": "share-phone",
            "ActionBody": "phone_reply",
            "Text": "Контакт",
            "TextVAlign": "middle",
            "TextHAlign": "center",
            "TextOpacity": 60,
            "TextSize": "regular"
        }
    ]

};

const INFO_KEYBOARD = {
    "Type": "keyboard",
    "Revision": 1,
    "Buttons": []
};

let subscribed = false;

bot.on(BotEvents.CONVERSATION_STARTED, (response) => {
    let key;

    if(subscribed){
        key = new TextMessage('Оберіть, що вас цікавить',SAMPLE_KEYBOARD, null, null, null, 3);
    } else {
        key = new TextMessage('Відправте нам свій контакт',CONTACT_KEYBOARD, null, null, null, 3);
    }

    bot.sendMessage(response.userProfile, key);
    //subscribed = true;
    console.log(subscribed)
})

bot.on(BotEvents.MESSAGE_RECEIVED, async (message, response) => {

    await knex('menu_items')
        .where('menu_id',2)
        .then(rows => {
            //myCache.set( "menu", rows, 12000 )
            return;
        }).catch( err => console.log(err) );

    if(message.constructor.name === "ContactMessage"){

        axios.post(process.env.API + 'viber/user/store', {
            user_id: response.userProfile.id,
            name: response.userProfile.name,
            phone : message.contactPhoneNumber,
            language : response.userProfile.language,
            status : 1,
            company : 'ua-tao'
        })
            .then( () => {
                subscribed = true;

                const msg = new TextMessage('Обери, що тебе цікавить:', SAMPLE_KEYBOARD, null, null, null, 3);

                bot.sendMessage(response.userProfile, msg, ['keyboard']);
                console.log('subscribed',subscribed);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    const x = new UrlMessage('viber://pa?chatURI=ua-tao');

    if (message.text === 'kb:home'){
        const msg = new TextMessage('Обери, що тебе цікавить:', SAMPLE_KEYBOARD, null, null, null, 3);
        bot.sendMessage(response.userProfile, msg);
        return;
    } else if (message.text === 'viber://pa?chatURI=ua-tao'){
        return;
    }

    if(message.trackingData[0] === 'keyboard' && message.text.includes('kb:') || message.text === 'kb:info'){
        let menu;
        let keys = [];
        INFO_KEYBOARD.Buttons = [];

        menu = await knex('menu_items')
            .where('menu_id',2)
            .then(rows => {
                //myCache.set( "menu", rows, 12000 )
                return rows;
            }).catch( err => console.log(err) );

        let id = message.text.slice(3);

        for(let btn of menu){
            if(btn.parent_id == id){
                INFO_KEYBOARD.Buttons.push({
                    //"Columns": 3,
                    //"Rows": 1,
                    "BgColor": "#dcdcdc",
                    //"BgLoop": true,
                    "ActionType": "reply",
                    "ActionBody": "kb:"+btn.id,
                    "Text": btn.title,
                })
            }  else if(!btn.parent_id && btn.id != id && id == 'info'){
                INFO_KEYBOARD.Buttons.push({
                    //"Columns": 3,
                    //"Rows": 1,
                    "BgColor": "#dcdcdc",
                    //"BgLoop": true,
                    "ActionType": "reply",
                    "ActionBody": "kb:"+btn.id,
                    "Text": btn.title,
                })
            }
        }

        let parent = menu.find(x => x.id == id)

        if(parent === undefined){
            INFO_KEYBOARD.Buttons.push({
                "BgColor": "#dcdcdc",
                "ActionType": "reply",
                "ActionBody": 'kb:home',
                "Text": 'Назад',
            })
        } else if(parent.parent_id == null){
            INFO_KEYBOARD.Buttons.push
            (
                {
                    "Columns": 3,
                    "Rows": 1,
                    "BgColor": "#dcdcdc",
                    "ActionType": "reply",
                    "ActionBody": 'kb:info',
                    "Text": 'Назад',
                },
                {
                    "Columns": 3,
                    "Rows": 1,
                    "BgColor": "#dcdcdc",
                    "ActionType": "reply",
                    "ActionBody": 'kb:home',
                    "Text": 'Головна',
                },
            )
        } else {
            console.log(parent.parent_id)
            INFO_KEYBOARD.Buttons.push
            (
                {
                    "Columns": 3,
                    "Rows": 1,
                    "BgColor": "#dcdcdc",
                    "ActionType": "reply",
                    "ActionBody": "kb:"+parent.parent_id,
                    "Text": 'Назад',
                },
                {
                    "Columns": 3,
                    "Rows": 1,
                    "BgColor": "#dcdcdc",
                    "ActionType": "reply",
                    "ActionBody": 'kb:home',
                    "Text": 'Головна',
                },
            )
        }

        let text = id === 'info' ? 'Обери, що тебе цікавить:' : menu.find(x => x.id == id)
        //const key = new KeyboardMessage(SAMPLE_KEYBOARD, null, null, null, 3);
        const msg = new TextMessage(text.text || text, INFO_KEYBOARD, null, null, null, 3);

        bot.sendMessage(response.userProfile, msg, ['keyboard']);
    } else {
        bot.sendMessage(response.userProfile, new TextMessage('Відправте нам свій контакт',CONTACT_KEYBOARD, null, null, null, 3));
    }



    //console.log(INFO_KEYBOARD.Buttons)
    //console.log(message.trackingData[0])
    //console.log(message)

});

bot.onUnsubscribe((userId) => {
    subscribed = false
    console.log(`Unsubscribed: ${userId}`)
});

router.use("/", bot.middleware());

module.exports = router;
