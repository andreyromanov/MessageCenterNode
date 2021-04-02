require('dotenv').config();
const express = require('express');
const router = express.Router();

const bot = require('../bots').telegram_bot;

const botViber = require('../bots').viber_bot;
const TextMessage = require('viber-bot').Message.Text;
const keyboard = require('../keyboard');

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host : process.env.HOST,
        user : process.env.db_USER,
        password : process.env.PASS,
        database : process.env.DB
    }
});

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

const {getPhoneNumber} = require('../helpers');

router.get('/', async (req,res) => {
    res.send('get request new')
    bot.sendMessage(391175023, 'Get request').catch((error) => {
        let code = error.response.body.error_code;

        if(code === 403){
            console.log(code, 'User has bloced bot (unsubscribed)');
            //Do action ...
        }
    });
});

router.post('/', async (req,res) => {
    try {
        //todo 1)refactor this function; 2)select from DB with whereIn
        let users;
        //data from api
        let keyName1 = req.body;

        if(myCache.has( "users" )){
            users = myCache.get( "users" )
            console.log('cache-users')
        } else{
            users = await knex.select().table('telegram_users')
                .then(rows => {
                    myCache.set( "users", rows, 12000 )
                    return rows;
                }).catch( err => console.log(err) );

        }

        keyName1.forEach(function(item){
            let user = users.find(x => getPhoneNumber(x.phone) === getPhoneNumber(item.phone))

            if(user && typeof user !== 'undefined'){
                console.log('find',user.user_id)
                queue.request((retry) => bot.sendMessage(user.user_id, item.text)
                    .catch(error => {
                        if (error.response.status === 429) { // We've got 429 - too many requests
                            return retry(error.response.data.parameters.retry_after) // usually 300 seconds
                        }
                        console.log('error',user.user_id, getPhoneNumber(x.phone), getPhoneNumber(item.phone))
                        throw error; // throw error further
                    }), user.user_id, 'broadcast');

            }
        })

        let viberUsers;

        if(myCache.has( "viberUsers" )){
            viberUsers = myCache.get( "viberUsers" );
        } else{
            viberUsers = await knex.select().table('viber_users')
                .then(rows => {
                    myCache.set( "viberUsers", rows, 12000 )
                    return rows;
                }).catch( err => console.log(err) );

        }

        keyName1.forEach(function(item){
            let viberUser = viberUsers.find(x => getPhoneNumber(x.phone) === getPhoneNumber(item.phone))
            if(viberUser){
                queue.request((retry) => botViber.sendMessage({id: viberUser.user_id}, new TextMessage(item.text, keyboard.viber_home_btns, null, null, null, 3))
                    .then(()=>{
                    })
                    .catch(error => {
                        if (error.response.status === 429) { // We've got 429 - too many requests
                            return retry(error.response.data.parameters.retry_after) // usually 300 seconds
                        }
                        throw error; // throw error further
                    }), viberUser.user_id, 'broadcast');
            }
        })
        //send response to server
        res.send('posted')
    } catch (e) {
        console.log(e + '');
    }
});

module.exports = router;
