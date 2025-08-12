const nodemailer = require('nodemailer'); // Require nodemailer for email
const twilio = require('twilio');         // Require twilio for SMS

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// This sendOtp function now handles both email and SMS based on the 'type' parameter
const sendOtp = async (recipient, otp, type = 'sms') => { // 'type' can be 'sms' or 'email'
    if (type === 'email') {
        const emailUser = process.env.EMAIL_USER;
        const emailAppPassword = process.env.EMAIL_APP_PASSWORD;

        if (!emailUser || !emailAppPassword) {
            console.error("Email credentials (EMAIL_USER, EMAIL_APP_PASSWORD) are not fully set in your .env file.");
            console.log(`Fallback: Email OTP ${otp} for ${recipient} logged to console.`);
            return false; // Indicate failure to send real email OTP
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail', // Using Gmail's SMTP server
            auth: {
                user: emailUser,
                pass: emailAppPassword
            }
        });

        const mailOptions = {
            from: emailUser,
            to: recipient, // This will be the user's email address
            subject: 'Your Exam-App OTP for Verification',
            html: `<p>Dear User,</p>
                   <p>Your One-Time Password (OTP) for Exam-App is: <strong>${otp}</strong></p>
                   <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
                   <p>Regards,<br>Exam-App Team</p>`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Email OTP sent successfully to ${recipient}`);
            return true;
        } catch (error) {
            console.error(`Failed to send email OTP to ${recipient}:`, error);
            console.error(`Nodemailer Error Details:`, error.message);
            // More detailed error logging for debugging
            if (error.responseCode) console.error(`SMTP Response Code: ${error.responseCode}`);
            if (error.command) console.error(`SMTP Command: ${error.command}`);
            return false;
        }
    } else { // Default to SMS if type is not 'email'
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !twilioPhoneNumber) {
            console.error("Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) are not fully set in your .env file. SMS OTP will only be logged to console.");
            console.log(`Fallback: SMS OTP ${otp} for ${recipient} logged to console.`);
            return false; // Indicate failure to send real SMS OTP
        }

        const client = new twilio(accountSid, authToken); // Use 'new twilio'

        try {
            // IMPORTANT: Ensure the contact number is in E.164 format (e.g., +91XXXXXXXXXX).
            const formattedContact = recipient.startsWith('+') ? recipient : `+91${recipient}`; // Example for India
            if (formattedContact.length < 10) { // Basic length check for valid phone number
                console.error(`Invalid contact number format for SMS: ${recipient}`);
                return false;
            }

            const message = await client.messages.create({
                body: `Your Exam-App OTP is: ${otp}`,
                from: twilioPhoneNumber,
                to: formattedContact
            });
            console.log(`SMS OTP sent successfully to ${formattedContact} via Twilio. Message SID: ${message.sid}`);
            return true;
        } catch (error) {
            console.error(`Failed to send SMS OTP to ${recipient} via Twilio:`, error);
            console.error(`Twilio Error Details:`, error.message);
            return false;
        }
    }
};

module.exports = {
    generateOtp,
    sendOtp
};