require('dotenv').config();
const express = require('express');
const router = express.Router();

const helper = require('../../helpers');
const keyboard = require('../../keyboard');
const bot = require('../../bots').bao_telegram_bot;

const NodeCache = require( "node-cache" );
const myCache = new NodeCache();

const Queue = require('smart-request-balancer');
const queue = new Queue({
    rules: {
        individual: {
            rate: 1,
            limit: 1,
            priority: 1
        },
        group: {
            rate: 20,
            limit: 60,
            priority: 1
        },
        broadcast: {
            rate: 30,
            limit: 1,
            priority: 2
        }
    },
    overall: {
        rate: 30,
        limit: 1
    }
});

const axios = require('axios');
const logger = require('../../logger');

//send info to users
//todo Move /cms-notification to api.js file
router.post('/cms-notification', async (req,res) => {

    const messages = JSON.parse(req.body.data);

    messages.forEach(function(msg){
        queue.request((retry) => bot.sendMessage(msg.dialog, msg.text)
            .then(()=>{
                bot.sendMessage(helper.getChatId(msg), `Головне меню`, {
                    reply_markup: {
                        inline_keyboard: keyboard.home
                    }
                })
            })
            .catch(error => {
                if (error.response.status === 429) { // We've got 429 - too many requests
                    return retry(error.response.data.parameters.retry_after) // usually 300 seconds
                }
                throw error; // throw error further
            }), msg.dialog, 'broadcast');
    });
    //debug
    bot.sendMessage(391175023, 'Рассылка уведомлений').catch((error) => {
        let code = error.response.body.error_code;

        if(code === 403){
            console.log(code, 'User has blocked bot (unsubscribed)');
        }
    });
    logger.info(`TELEGRAM BROADCAST - ${JSON.stringify(req.body)}`)
    res.send('broadcasted')
});

//USER ENTERS CHAT
bot.on("text", msg => {
    let { text } = msg;
    if (/\/start/.test(text)){
        let option = {
            "parse_mode": "Markdown",
            "reply_markup": {
                "one_time_keyboard": true,
                "keyboard": [[{
                    text: "Відправити мій номер телефону",
                    request_contact: true,
                    one_time_keyboard: true
                }]]
            }
        };
        bot.sendMessage(helper.getChatId(msg), `Для швидкої реєстрації тисни кнопку 'Відправити мій номер телефону'`, option)

    } else if(/\/menu/.test(text)){
        bot.sendMessage(helper.getChatId(msg), `Головне меню`, {
            reply_markup: {
                inline_keyboard: keyboard.home
            }
        })
    } else {
        bot.deleteMessage(msg.chat.id, msg.message_id)
    }

});
//USER SENDS CONTACT
bot.on("contact",(msg)=>{
    bot.sendMessage(helper.getChatId(msg), `Дякую!`, {
        reply_markup: {
            remove_keyboard: true
        }
    }).then(()=>{
        let data = {
            user_id: msg.contact.user_id,
            first_name: msg.contact.first_name,
            last_name : msg.contact.last_name,
            phone : msg.contact.phone_number,
            language : msg.from.language_code,
            register_date : msg.date,
            status : 1,
            company_name : 'bao'
        };
        axios.post(process.env.API + 'telegram/user/store', data)
            .then(function (response) {
                logger.info(`NEW USER - ${JSON.stringify(data)}`)
            })
            .catch(function (error) {
                logger.error(`NEW USER ERROR - ${JSON.stringify(error)}`)
            });

        bot.sendMessage(helper.getChatId(msg), `Головне меню`, {
            reply_markup: {
                inline_keyboard: keyboard.home
            }
        })
    })
});
//USER PUSHES MENU BUTTONS
bot.on('callback_query', async query => {
    const { data } = query;
    const { id } = query.message.chat;

    if(data !== 'operator' && data !== 'home'){

        let menu;
        let keys = [];

        if(myCache.has( "menu" )){
            menu = myCache.get( "menu" )
            console.log('cache')
        } else{
            await axios.get(process.env.API + 'menu', {params:{
                    company : 'bao'
                }})
                .then( (data) => {
                    myCache.set( "menu", data.data, 12000 )
                    menu = data.data;
                })
                .catch(function (error) {
                    console.log(error);
                });
        }

        for(let btn of menu){
            if(btn.parent_id == data){
                keys.push([{
                    text: btn.title,
                    callback_data: btn.id
                }])
            }  else if(!btn.parent_id && btn.id != data && data == 'info'){
                keys.push([{
                    text: btn.title,
                    callback_data: btn.id
                }])
            }
        }
        let parent = menu.find(x => x.id == data)

        if(parent === undefined){
            keys.push([
                {
                    text: 'Назад',
                    callback_data: 'home'
                }
            ])
        } else if(parent.parent_id == null){
            keys.push([
                {
                    text: 'Назад',
                    callback_data: 'info'
                },
                {
                    text: 'Головна',
                    callback_data: 'home'
                }
            ])
        } else {
            keys.push([
                {
                    text: 'Назад',
                    callback_data: parent.parent_id
                },
                {
                    text: 'Головна',
                    callback_data: 'home'
                }
            ])
        }

        let text = data === 'info' ? 'Обери, що тебе цікавить:' : menu.find(x => x.id == data)

        bot.deleteMessage(id, query.message.message_id)

        bot.sendMessage(id, text.text || text, {
            reply_markup: {
                inline_keyboard: keys
            }
        })
    }
    switch (data) {
        case 'operator':
            bot.editMessageText( `Перейдіть для звя'зку з оператором: @uatao_bot`, {
                chat_id : id,
                message_id: query.message.message_id,
                reply_markup: {
                    inline_keyboard: keyboard.operator
                }
            })
            break
        case 'home':
            bot.editMessageText( `Головне меню`, {
                chat_id : id,
                message_id: query.message.message_id,
                reply_markup: {
                    inline_keyboard: keyboard.home
                }
            })
            break
    }
});

//debug
bot.on('polling_error', (error) => {
    //console.log(error);  // => 'EFATAL'
    logger.error(`polling_error - ${JSON.stringify(error)}`)
});
bot.sendMessage(391175023, 'Launched bot1').catch((error) => {
    console.log(error)
    let code = error.response.body.error_code;

    if(code === 403){
        console.log(code, 'User has blocked bot (unsubscribed)');
        //Do action ...
    }
});

module.exports = router;
