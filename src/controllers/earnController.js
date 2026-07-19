"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerWeeklyDraw = exports.getTickets = exports.getStats = exports.getTransactions = exports.withdrawCoins = exports.earnFromTask = exports.earnFromAd = void 0;
const User_1 = require("../models/User");
const Transaction_1 = require("../models/Transaction");
const LotteryTicket_1 = require("../models/LotteryTicket");

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

// Trigger Weekly Draw (Admin conceptually)
const triggerWeeklyDraw = async (req, res) => {
    try {
        const activeTickets = await LotteryTicket_1.LotteryTicket.find({ status: 'active' });
        if (activeTickets.length === 0) {
            return res.json({ message: 'No active tickets for the draw' });
        }

        const winnerIndex = Math.floor(Math.random() * activeTickets.length);
        const winningTicket = activeTickets[winnerIndex];

        await LotteryTicket_1.LotteryTicket.updateMany({ status: 'active' }, { status: 'lost' });

        winningTicket.status = 'won';
        await winningTicket.save();

        const winnerUser = await User_1.User.findById(winningTicket.userId);
        if (winnerUser) {
            winnerUser.earnCoins = (winnerUser.earnCoins || 0) + 500;
            await winnerUser.save();
            await Transaction_1.Transaction.create({
                userId: winnerUser._id,
                type: 'earn',
                amount: 500,
                description: `Won Weekly Lottery! Ticket #${winningTicket.ticketNumber}`,
                status: 'success'
            });
        }

        res.json({ message: 'Draw completed', winningTicket: winningTicket.ticketNumber });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.triggerWeeklyDraw = triggerWeeklyDraw;

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
