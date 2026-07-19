const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User } = require('./src/models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = 'marothihemasundar03@gmail.com';
        let user = await User.findOne({ email });

        if (user) {
            console.log('User already exists, updating password and role to admin...');
            user.password = '9666180813';
            user.role = 'admin';
            await user.save();
            console.log('User updated to admin successfully!');
        } else {
            console.log('User not found. Creating admin user...');
            user = new User({
                name: 'Admin',
                email: email,
                password: '9666180813',
                role: 'admin',
            });
            await user.save();
            console.log('Admin user created successfully!');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        mongoose.connection.close();
    }
};

createAdmin();
