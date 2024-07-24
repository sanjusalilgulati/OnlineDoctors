var cron = require('node-cron');
const calls = require('../models/calls');
const { sendPushNotification } = require('./sendPushNotification');


var CallReminder = cron.schedule('* * * * *', async (req, res) => {
    console.log('This is my cron that is written in config cron file & its running a task every minute');
});

CallReminder.stop();

