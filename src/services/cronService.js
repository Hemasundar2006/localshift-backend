const cron = require('node-cron');
const { Expo } = require('expo-server-sdk');
const { User } = require('../models/User');

const expo = new Expo();

const initCronJobs = () => {
  console.log('Initializing cron jobs...');
  
  // Set up the daily maintenance notification (runs at 00:00 every day)
  // For testing purposes, you can temporarily change '0 0 * * *' to '* * * * *' (every minute)
  cron.schedule('0 0 * * *', async () => {
    console.log('Triggering scheduled job: System Maintenance Push Notification (12:00 AM)');
    
    try {
      // Find all users who have a pushToken
      const users = await User.find({ pushToken: { $exists: true, $ne: null, $ne: '' } });
      
      if (users.length === 0) {
        console.log('No users found with valid push tokens.');
        return;
      }

      console.log(`Found ${users.length} user(s) with push tokens. Preparing notifications...`);

      let messages = [];
      for (let user of users) {
        if (!Expo.isExpoPushToken(user.pushToken)) {
          console.warn(`Token ${user.pushToken} is not a valid Expo push token (User: ${user.email})`);
          continue;
        }

        messages.push({
          to: user.pushToken,
          sound: 'default',
          title: 'System Maintenance',
          body: 'The system is currently in maintenance mode. We apologize for any inconvenience.',
          data: { type: 'maintenance' },
        });
      }

      if (messages.length === 0) {
        console.log('No valid Expo push tokens found. Exiting job.');
        return;
      }

      // The Expo SDK automatically chunks messages so we don't exceed API limits
      let chunks = expo.chunkPushNotifications(messages);
      
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log('Sent chunk of push notifications:', ticketChunk);
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
        }
      }
      
      console.log('Successfully sent maintenance notifications.');
    } catch (error) {
      console.error('Error executing maintenance cron job:', error);
    }
  });
  // Weekly Lottery Draw - Every Sunday at 10:41 AM
  cron.schedule('41 10 * * 0', async () => {
    console.log('Triggering Weekly Lottery Draw (Sunday 10:41 AM)');
    const { triggerWeeklyDraw } = require('../controllers/earnController');
    try {
      await triggerWeeklyDraw(null, null); // Pass null for req and res
      console.log('Weekly Lottery Draw completed.');
    } catch (e) {
      console.error('Error triggering weekly draw via cron:', e);
    }
  });
};

module.exports = { initCronJobs };
