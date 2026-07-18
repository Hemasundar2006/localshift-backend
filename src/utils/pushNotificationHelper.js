// Node backend handles standard HTTP POST requests securely to Expo push endpoints framework servers directly
async function sendExpoPushNotification(targetExpoToken, title, messageBody) {
  if (!targetExpoToken || !targetExpoToken.includes('ExponentPushToken')) {
      console.log('Invalid Expo Push Token:', targetExpoToken);
      return;
  }

  const payloadMessage = {
    to: targetExpoToken, // The saved token array format standard strings tracking match
    sound: 'default',
    title: title,
    body: messageBody,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', { // Expo official API gateway
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadMessage),
    });
    
    const outcomeResult = await response.json();
    console.log('Expo API execution feedback response parsed confirmation metric checks data:', outcomeResult);
  } catch (error) {
    console.error('Failed dispatch payload properties trigger error tracking context logs:', error);
  }
}

module.exports = { sendExpoPushNotification };
