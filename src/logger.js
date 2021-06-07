const pino = require('pino');
const path = require('path')

const date = new Date().toISOString().slice(0, 10);
const logger = pino(
    {
        prettyPrint: {
            colorize: false,
            levelFirst: false,
            translateTime: "yyyy-dd-mm, h:MM:ss TT",
        },
    },
    pino.destination(path.dirname(require.main.filename)+`/../logs/${date}.log`)
);

module.exports = logger;