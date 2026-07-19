"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables FIRST
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const smsRoutes_1 = __importDefault(require("./routes/smsRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const jobRoutes_1 = __importDefault(require("./routes/jobRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
const feedbackRoutes = require("./routes/feedbackRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const earnRoutes_1 = __importDefault(require("./routes/earnRoutes"));
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
const feedbackRoutes_1 = __importDefault(require("./routes/feedbackRoutes"));
const appVersionRoutes_1 = __importDefault(require("./routes/appVersionRoutes"));
// Connect to database
(0, db_1.connectDB)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/auth', authRoutes_1.default);
// app.use('/api/payment', paymentRoutes_1.default);
app.use('/api/sms', smsRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/jobs', jobRoutes_1.default);
app.use('/api/services', serviceRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/chats', chatRoutes_1.default);
app.use('/api/stats', statsRoutes_1.default);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/earn', earnRoutes_1.default);
app.use('/api/feedback', feedbackRoutes_1.default);
app.use('/api/app-versions', appVersionRoutes_1.default);
app.get('/', (req, res) => {
    res.send('LocalShift API is running!');
});
// Error Middleware
app.use(errorMiddleware_1.notFound);
app.use(errorMiddleware_1.errorHandler);
// Initialize cron jobs
const { initCronJobs } = require('./services/cronService');
initCronJobs();

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map