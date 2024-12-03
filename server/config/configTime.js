// config/config.js

const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const config = {

    // timeApi: {
    //     url: process.env.TIME_API_URL || 'http://worldtimeapi.org/api/timezone/Asia/Karachi',
    //     // defaultTimezone: process.env.TIMEZONE || 'Asia/Karachi',
    // },
    TIME_SERVER_URL: "http://worldtimeapi.org/api/timezone",
    TIMEZONE:'/Asia/Karachi'
};

module.exports = config;
