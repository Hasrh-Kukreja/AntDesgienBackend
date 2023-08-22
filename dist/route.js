'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { 'default': mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const body_parser_1 = __importDefault(require('body-parser'));
const cors_1 = __importDefault(require('cors'));
const dotenv_1 = __importDefault(require('dotenv'));
const bcryptjs_1 = __importDefault(require('bcryptjs'));
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const client_1 = require('@prisma/client');
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and Password are required' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await prisma.login.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
            },
        });
        res.json(newUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
});
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and Password are required' });
        }
        const user = await prisma.login.findUnique({
            where: {
                email: email.toLowerCase(),
            },
        });
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
});
