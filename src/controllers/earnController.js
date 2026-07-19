"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerWeeklyDraw = exports.getTickets = exports.getStats = exports.getTransactions = exports.withdrawCoins = exports.earnFromTask = exports.earnFromAd = void 0;
const User_1 = require("../models/User");
const Transaction_1 = require("../models/Transaction");
const LotteryTicket_1 = require("../models/LotteryTicket");
const LotteryWinner_1 = require("../models/LotteryWinner");

// Watch an ad to earn 1 coin
const earnFromAd = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!user.lastAdWatchDate || user.lastAdWatchDate < today) {
            user.adsWatchedToday = 0;
        }

        if (user.adsWatchedToday >= 5) {
            return res.status(400).json({ message: 'Daily ad limit reached (5/5).' });
        }

        user.adsWatchedToday = (user.adsWatchedToday || 0) + 1;
        user.lastAdWatchDate = new Date();

        let earnedTicket = false;
        let newTicketId = null;
        if (user.adsWatchedToday % 5 === 0) {
            user.lotteryTickets = (user.lotteryTickets || 0) + 1;
            
            const ticketNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
            await LotteryTicket_1.LotteryTicket.create({
                userId: user._id,
                ticketNumber,
                drawDate: new Date()
            });
            newTicketId = ticketNumber;
            earnedTicket = true;
        }

        user.earnCoins = (user.earnCoins || 0) + 1;
        await user.save();

        if (earnedTicket) {
             await Transaction_1.Transaction.create({
                 userId: user._id,
                 type: 'earn',
                 amount: 0,
                 description: `Earned Lottery Ticket #${newTicketId}!`,
                 status: 'success'
             });
        }

        const transaction = await Transaction_1.Transaction.create({
            userId: user._id,
            type: 'earn',
            amount: 1,
            description: 'Watched an Ad',
            status: 'success'
        });

        res.json({ 
            earnCoins: user.earnCoins, 
            transaction,
            adsWatchedToday: user.adsWatchedToday,
            lotteryTickets: user.lotteryTickets || 0,
            earnedTicket,
            newTicketId
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.earnFromAd = earnFromAd;

// Get User Tickets
const getTickets = async (req, res) => {
    try {
        const tickets = await LotteryTicket_1.LotteryTicket.find({ userId: req.user._id, status: 'active' }).sort({ createdAt: -1 });
        res.json({ tickets });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getTickets = getTickets;

// Trigger Weekly Draw (Can be called via API or Cron)
const triggerWeeklyDraw = async (req, res) => {
    try {
        const activeTickets = await LotteryTicket_1.LotteryTicket.find({ status: 'active' });
        
        // Group by user
        const userTicketCount = {};
        activeTickets.forEach(t => {
            const uid = t.userId.toString();
            if (!userTicketCount[uid]) userTicketCount[uid] = { userId: t.userId, tickets: [] };
            userTicketCount[uid].tickets.push(t);
        });

        // Filter eligible (>= 6 tickets)
        const eligibleUsers = Object.values(userTicketCount).filter(u => u.tickets.length >= 6);

        if (eligibleUsers.length === 0) {
            // Expire all tickets
            await LotteryTicket_1.LotteryTicket.updateMany({ status: 'active' }, { status: 'lost' });
            if (res) return res.json({ message: 'No eligible users for the draw. All tickets reset.' });
            return;
        }

        const winnerIndex = Math.floor(Math.random() * eligibleUsers.length);
        const winningUserGroup = eligibleUsers[winnerIndex];
        const winningTicket = winningUserGroup.tickets[0];

        // Mark all as lost
        await LotteryTicket_1.LotteryTicket.updateMany({ status: 'active' }, { status: 'lost' });

        // Update winning ticket to won
        await LotteryTicket_1.LotteryTicket.findByIdAndUpdate(winningTicket._id, { status: 'won' });

        const winnerUser = await User_1.User.findById(winningTicket.userId);
        if (winnerUser) {
            winnerUser.earnCoins = (winnerUser.earnCoins || 0) + 200;
            await winnerUser.save();
            
            await Transaction_1.Transaction.create({
                userId: winnerUser._id,
                type: 'earn',
                amount: 200,
                description: `Won Weekly Lottery! Ticket #${winningTicket.ticketNumber}`,
                status: 'success'
            });

            // Save winner record for admin
            await LotteryWinner_1.LotteryWinner.create({
                userId: winnerUser._id,
                name: winnerUser.name,
                mobileNumber: winnerUser.phone || '',
                ticketNumber: winningTicket.ticketNumber,
                prizeAmount: 200
            });

            // Send Push Notification
            if (winnerUser.pushToken) {
                const { Expo } = require('expo-server-sdk');
                const expo = new Expo();
                if (Expo.isExpoPushToken(winnerUser.pushToken)) {
                    try {
                        await expo.sendPushNotificationsAsync([{
                            to: winnerUser.pushToken,
                            sound: 'default',
                            title: '🎉 You Won the Weekly Draw!',
                            body: `Congratulations ${winnerUser.name}! You won 200 coins in this week's lottery!`,
                            data: { type: 'lottery_winner' },
                        }]);
                    } catch (e) {
                        console.error('Push notification failed:', e);
                    }
                }
            }
        }

        if (res) res.json({ message: 'Draw completed', winningTicket: winningTicket.ticketNumber });
    } catch (error) {
        console.error('Error in triggerWeeklyDraw:', error);
        if (res) res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.triggerWeeklyDraw = triggerWeeklyDraw;

// Get eligible tickets for the live draw
const getEligibleTickets = async (req, res) => {
    try {
        const activeTickets = await LotteryTicket_1.LotteryTicket.find({ status: 'active' }).populate('userId', 'name avatarUrl');
        
        const userTicketCount = {};
        activeTickets.forEach(t => {
            if (t.userId) {
                const uid = t.userId._id.toString();
                if (!userTicketCount[uid]) userTicketCount[uid] = { user: t.userId, count: 0, tickets: [] };
                userTicketCount[uid].count++;
                userTicketCount[uid].tickets.push(t);
            }
        });

        const eligibleTickets = [];
        Object.values(userTicketCount).forEach(userData => {
            if (userData.count >= 6) {
                eligibleTickets.push(...userData.tickets);
            }
        });

        res.json({ eligibleTickets });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getEligibleTickets = getEligibleTickets;

// Get latest winner
const getLatestWinner = async (req, res) => {
    try {
        const latestWinner = await LotteryTicket_1.LotteryTicket.findOne({ status: 'won' })
            .sort({ updatedAt: -1 })
            .populate('userId', 'name avatarUrl');
            
        res.json({ latestWinner });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getLatestWinner = getLatestWinner;

// Get recent winners (marquee)
const getRecentWinners = async (req, res) => {
    try {
        const recentWinners = await LotteryWinner_1.LotteryWinner.find({})
            .sort({ drawDate: -1 })
            .limit(10)
            .select('name ticketNumber prizeAmount drawDate -_id'); // Exclude mobile number and userId
            
        res.json({ recentWinners });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getRecentWinners = getRecentWinners;

// Complete a task (survey/app test) to earn coins
const earnFromTask = async (req, res) => {
    try {
        const { taskType, reward, title } = req.body;
        
        if (!reward || reward <= 0) {
            return res.status(400).json({ message: 'Invalid reward amount' });
        }

        const user = await User_1.User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.earnCoins = (user.earnCoins || 0) + Number(reward);
        await user.save();

        const transaction = await Transaction_1.Transaction.create({
            userId: user._id,
            type: 'earn',
            amount: Number(reward),
            description: `Task Completed: ${title} (${taskType})`,
            status: 'success'
        });

        res.json({ earnCoins: user.earnCoins, transaction });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.earnFromTask = earnFromTask;

// Withdraw coins
const withdrawCoins = async (req, res) => {
    try {
        const { amount, paymentMethod, paymentDetails } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid withdrawal amount' });
        }

        if (!paymentMethod || !paymentDetails) {
            return res.status(400).json({ message: 'Payment method and details are required' });
        }

        const user = await User_1.User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if ((user.earnCoins || 0) < Number(amount)) {
            return res.status(400).json({ message: 'Insufficient earn coins' });
        }

        user.earnCoins = user.earnCoins - Number(amount);
        await user.save();

        const transaction = await Transaction_1.Transaction.create({
            userId: user._id,
            type: 'withdraw',
            amount: Number(amount),
            rupees: Number(amount), // 1 coin = 1 rupee
            description: `Withdrawal to ${paymentMethod}`,
            paymentMethod,
            paymentDetails,
            status: 'success' // or 'pending' if it requires manual approval
        });

        res.json({ earnCoins: user.earnCoins, transaction });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.withdrawCoins = withdrawCoins;

// Get transaction history
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction_1.Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getTransactions = getTransactions;

// Get earn stats
const getStats = async (req, res) => {
    try {
        const transactions = await Transaction_1.Transaction.find({ userId: req.user._id });
        
        let totalEarned = 0;
        let pendingApproval = 0;
        let withdrawn = 0;

        transactions.forEach(t => {
            if (t.type === 'earn') {
                if (t.status === 'success') totalEarned += t.amount;
                else if (t.status === 'pending') pendingApproval += t.amount;
            } else if (t.type === 'withdraw') {
                if (t.status === 'success') withdrawn += t.amount;
                else if (t.status === 'pending') pendingApproval += t.amount;
            }
        });

        res.json({ totalEarned, pendingApproval, withdrawn });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getStats = getStats;
