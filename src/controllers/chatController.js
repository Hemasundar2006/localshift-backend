"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.declineRequest = exports.acceptRequest = exports.sendRequest = exports.getChats = void 0;
const Chat_1 = require("../models/Chat");
const User_1 = require("../models/User");

exports.getChats = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find chats where user is either seeker or employer
        const chats = await Chat_1.Chat.find({
            $or: [{ seekerId: userId }, { employerId: userId }]
        }).populate('seekerId', 'name').populate('employerId', 'name shopName');
        
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.sendRequest = async (req, res) => {
    try {
        const seekerId = req.user.id;
        const { employerId } = req.body;

        const user = await User_1.User.findById(seekerId);
        if (!user || user.coins < 50) {
            return res.status(400).json({ message: 'Not enough coins' });
        }

        let chat = await Chat_1.Chat.findOne({ seekerId, employerId });
        
        if (chat && chat.status !== 'locked') {
            return res.status(400).json({ message: 'Chat request already sent or accepted' });
        }

        // Deduct coins
        user.coins -= 50;
        await user.save();

        if (!chat) {
            chat = new Chat_1.Chat({
                seekerId,
                employerId,
                status: 'pending',
                messages: []
            });
        } else {
            chat.status = 'pending';
        }

        await chat.save();
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.acceptRequest = async (req, res) => {
    try {
        const chatId = req.params.id;
        const chat = await Chat_1.Chat.findById(chatId);

        if (!chat || chat.employerId.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        chat.status = 'accepted';
        await chat.save();
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.declineRequest = async (req, res) => {
    try {
        const chatId = req.params.id;
        const chat = await Chat_1.Chat.findById(chatId);

        if (!chat || chat.employerId.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Refund coins to seeker
        const seeker = await User_1.User.findById(chat.seekerId);
        if (seeker) {
            seeker.coins += 50;
            await seeker.save();
        }

        chat.status = 'locked';
        await chat.save();
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const chatId = req.params.id;
        const { text } = req.body;
        const senderId = req.user.id;

        const chat = await Chat_1.Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        if (chat.status !== 'accepted') {
            return res.status(400).json({ message: 'Chat must be accepted to send messages' });
        }

        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        chat.messages.push({
            senderId,
            text,
            time: timeString,
            status: 'sent'
        });

        chat.lastActive = 'Online';
        await chat.save();
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
