"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = void 0;
const axios = require('axios');

const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
    if (!expoPushToken) return;

    const message = {
        to: expoPushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
    };

    try {
        await axios.post('https://exp.host/--/api/v2/push/send', message, {
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
};

exports.sendPushNotification = sendPushNotification;
