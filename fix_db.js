const mongoose = require('mongoose');
require('dotenv').config({path: './.env'});

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./src/models/User').User;
  const res = await User.updateMany({ role: 'user' }, { $set: { role: 'employer' } });
  console.log('Updated users:', res.modifiedCount);
  process.exit(0);
});
