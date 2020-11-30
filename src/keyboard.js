module.exports = {
    home:[
        /*[
            {
                text: 'Кабінет',
                callback_data: 'cabinet'
            }
        ],*/
        [
            {
                text: '🔎 Довідка',
                callback_data: 'info'
            },
            {
                text: '📞 Оператор',
                callback_data: 'operator'
            }
        ],
        /*[
            {
                text: '🖥️ ua-tao.com',
                url: 'https://ua-tao.com'
            }
        ]*/
    ],
    info:[
        [
            {
                text: 'Доставка',
                callback_data: 'delivery'
            },
            {
                text: 'Оплата',
                callback_data: 'payment'
            }
        ],
        [
            {
                text: 'Назад',
                callback_data: 'home'
            }
        ]
    ],
    cabinet:[
        [
            {
                text: 'Назад',
                callback_data: 'home'
            }
        ]
    ],
    operator:[
        [
            {
                text: 'Назад',
                callback_data: 'home'
            }
        ]
    ],

    viber_home_btns : [
        {
            "Columns": 3,
            "Rows": 1,
            "BgColor": "#dcdcdc",
            "BgLoop": true,
            "ActionType": "reply",
            "ActionBody": "kb:info",
            "Text": "Довідка",
            "TextVAlign": "middle",
            "TextHAlign": "center",
            "TextOpacity": 60,
            "TextSize": "regular"
        },
        {
        "Columns": 3,
        "Rows": 1,
        "BgColor": "#dcdcdc",
        "BgLoop": true,
        "ActionType": "open-url",
        "ActionBody": "viber://pa?chatURI=ua-tao",
        "Text": "Оператор",
        "TextVAlign": "middle",
        "TextHAlign": "center",
        "TextOpacity": 60,
        "TextSize": "regular"
        }
    ],
    viber_contact_btns : [
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
}