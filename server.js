import express from 'express';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('--- AURA Server Startup ---');
console.log('Target Email:', process.env.GMAIL_USER);
console.log('App Password Set:', !!process.env.GMAIL_APP_PASSWORD);
console.log('MongoDB URI Set:', !!process.env.MONGODB_URI);

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const subscriptionSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now }
});

const prospectusRequestSchema = new mongoose.Schema({
    email: { type: String, required: true },
    schoolName: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
const ProspectusRequest = mongoose.model('ProspectusRequest', prospectusRequestSchema);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Verify Transporter
transporter.verify((error, success) => {
    if (error) {
        console.error('Nodemailer Verification Error:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

// Routes
app.post('/api/subscribe', async (req, res) => {
    const { email } = req.body;
    try {
        // Save to DB
        const newSub = new Subscription({ email });
        await newSub.save();

        // Send Email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Welcome to AURA Inner Circle',
            text: `Welcome to the Inner Circle! Your premium dossier is being prepared and will be dispatched to your inbox shortly.\n\nBest regards,\nAURA Team`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Subscription successful' });
    } catch (error) {
        console.error('Subscription error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already subscribed' });
        }
        if (error.code === 'EAUTH') {
            return res.status(500).json({ message: 'Email service authentication failed. Please check GMAIL_APP_PASSWORD in .env' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/prospectus', async (req, res) => {
    const { email, schoolName, message } = req.body;
    console.log(`Prospectus request received for: ${schoolName} (Email: ${email})`);
    console.log(`Message Length: ${message ? message.length : 0} characters`);
    try {
        // Save to DB
        const newRequest = new ProspectusRequest({ email, schoolName });
        await newRequest.save();

        // Send Email
        const mailOptions = {
            from: `"AURA Signature Series" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `[AURA] Institutional Dossier: ${schoolName}`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #050505; color: #ffffff; padding: 40px; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 8px; overflow: hidden;">
                        <div style="padding: 30px; text-align: center; border-bottom: 1px solid #1a1a1a;">
                            <div style="display: inline-block; width: 12px; height: 12px; background-color: #6366f1; border-radius: 50%; margin-right: 10px;"></div>
                            <span style="font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #ffffff;">AURA</span>
                            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; margin-top: 5px;">Institutional Intelligence</p>
                        </div>
                        <div style="padding: 40px;">
                            <h2 style="font-size: 20px; font-weight: 300; letter-spacing: 1px; color: #6366f1;">Premium Institutional Dossier</h2>
                            <h1 style="font-size: 32px; margin-top: 10px; margin-bottom: 30px;">${schoolName}</h1>
                            
                            <div style="white-space: pre-line; color: #a1a1aa; font-size: 15px;">
                                ${message}
                            </div>
                            
                            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #1a1a1a; text-align: center;">
                                <p style="font-size: 12px; color: #52525b;">DISPATCHED BY AURA SIGNATURE SERIES</p>
                                <p style="font-size: 11px; color: #3f3f46;">&copy; 2026 AURA. Verified Institutional Partner.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Prospectus sent' });
    } catch (error) {
        console.error('--- FULL DISPATCH ERROR ---');
        console.error(error);
        if (error.code === 'EAUTH') {
            return res.status(500).json({ message: 'Email service authentication failed. Please check GMAIL_APP_PASSWORD in .env' });
        }
        res.status(500).json({ message: `Dispatch Error: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
