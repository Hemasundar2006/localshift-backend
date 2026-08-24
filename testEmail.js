require('dotenv').config();
const { sendEmailOTP } = require('./src/services/emailService');

async function test() {
    console.log("Testing email OTP...");
    const result = await sendEmailOTP('teluguinfostudent@gmail.com', '123456');
    if (result) {
        console.log("SUCCESS: Email sent!");
    } else {
        console.log("FAILED: Email not sent.");
    }
}
test();
