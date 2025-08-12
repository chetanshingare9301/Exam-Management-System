const bcrypt = require('bcryptjs');
const regModels = require('../models/regModels');
const { generateOtp, sendOtp } = require('./otpService'); // Import otpService

const OTP_EXPIRY_MINUTES = 5; // OTP valid for 5 minutes

// --- Student Services ---

const registerStudent = async (name, password, email, contact, username) => {
    try {
        const existingStudent = await regModels.findStudentByEmail(email);
        if (existingStudent) {
            return { success: false, message: "Student with this email already exists." };
        }
        const existingStudentContact = await regModels.findStudentByContact(contact);
        if (existingStudentContact) {
            return { success: false, message: "Student with this contact number already exists." };
        }
        // Check for existing username (important for login)
        const existingStudentUsername = await regModels.findStudentByUsername(username);
        if (existingStudentUsername) {
            return { success: false, message: "Student with this username already exists." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const emailOtp = generateOtp();
        const emailOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        const contactOtp = generateOtp();
        const contactOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        const result = await regModels.saveStudentWithDualOtp(name, hashedPassword, email, contact, username, emailOtp, emailOtpExpiresAt, contactOtp, contactOtpExpiresAt);

        if (result.affectedRows === 1) {
            await sendOtp(email, emailOtp, 'email'); // Send email OTP
            await sendOtp(contact, contactOtp, 'sms'); // Send SMS OTP
            return { success: true, message: "Registration successful. Please verify your email and contact number.", email: email, contact: contact };
        } else {
            return { success: false, message: "Registration failed." };
        }
    } catch (error) {
        console.error("Error registering student:", error);
        return { success: false, message: "An error occurred during registration." };
    }
};

const verifyStudentOtp = async (identifier, otp, type) => { // identifier can be email or contact
    try {
        let user;
        if (type === 'email') {
            user = await regModels.findStudentByEmailAndEmailOtp(identifier, otp);
        } else if (type === 'contact') {
            user = await regModels.findStudentByContactAndContactOtp(identifier, otp);
        } else {
            return { success: false, message: "Invalid verification type." };
        }

        if (!user) {
            return { success: false, message: "Invalid OTP or identifier." };
        }

        const otpExpiresAt = type === 'email' ? user.email_otp_expires_at : user.contact_otp_expires_at;
        if (new Date() > new Date(otpExpiresAt)) {
            return { success: false, message: "OTP has expired. Please request a new one." };
        }

        if (type === 'email') {
            await regModels.updateStudentEmailVerification(user.stid);
            return { success: true, message: "Email verified successfully!" };
        } else {
            await regModels.updateStudentContactVerification(user.stid);
            return { success: true, message: "Contact verified successfully!" };
        }

    } catch (error) {
        console.error("Error verifying student OTP:", error);
        return { success: false, message: "An error occurred during verification." };
    }
};

const resendStudentOtp = async (identifier, type) => { // identifier can be email or contact
    try {
        const student = type === 'email' ? await regModels.findStudentByEmail(identifier) : await regModels.findStudentByContact(identifier);

        if (!student) {
            return { success: false, message: `Student with this ${type} not found.` };
        }

        const newOtp = generateOtp();
        const newOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        if (type === 'email') {
            await regModels.updateStudentEmailOtpForResend(student.stid, newOtp, newOtpExpiresAt);
            await sendOtp(identifier, newOtp, 'email');
            return { success: true, message: "New email OTP sent successfully." };
        } else { // type === 'contact'
            await regModels.updateStudentContactOtpForResend(student.stid, newOtp, newOtpExpiresAt);
            await sendOtp(identifier, newOtp, 'sms');
            return { success: true, message: "New SMS OTP sent successfully." };
        }

    } catch (error) {
        console.error("Error resending student OTP:", error);
        return { success: false, message: "An error occurred while resending OTP." };
    }
};

const loginStudent = async (email, password) => {
    try {
        const student = await regModels.findStudentByEmail(email);
        if (!student) {
            return { success: false, message: "Student not found." };
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return { success: false, message: "Incorrect password." };
        }

        // Check verification status
        if (!student.is_email_verified || !student.is_contact_verified) {
            let message = "Please verify your account.";
            if (!student.is_email_verified) {
                message += " Email needs verification.";
                const newOtp = generateOtp();
                const newOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
                await regModels.updateStudentEmailOtpForResend(student.stid, newOtp, newOtpExpiresAt);
                await sendOtp(student.email, newOtp, 'email');
            }
            if (!student.is_contact_verified) {
                message += " Contact needs verification.";
                const newOtp = generateOtp();
                const newOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
                await regModels.updateStudentContactOtpForResend(student.stid, newOtp, newOtpExpiresAt);
                await sendOtp(student.contact, newOtp, 'sms');
            }
            return { success: false, message: message, requiresVerification: true, email: student.email, contact: student.contact };
        }

        return { success: true, message: "Login successful!", user: student };
    } catch (error) {
        console.error("Error logging in student:", error);
        return { success: false, message: "An error occurred during login." };
    }
};

// *******************************************************************
// NEW ADDITION: Admin Student Management - Add Student Service
// This function calls the model to create a new student record
// *******************************************************************
const addStudentByAdmin = async (studentData) => {
    try {
        // You might add more complex logic here if needed before calling the model
        // For example, additional data processing or external API calls
        const result = await regModels.createStudentByAdmin(studentData); // Call the model function to save the student
        if (result && result.id) { // Assuming createStudentByAdmin returns an object with an 'id'
            return { success: true, message: 'Student added successfully!', studentId: result.id };
        } else {
            return { success: false, message: 'Failed to add student to database.' };
        }
    } catch (error) {
        // Check for specific database errors, e.g., duplicate entry if username/email are unique
        // The regModels.createStudentByAdmin should ideally handle this and return a specific message.
        // If not, you might need more granular error parsing here.
        if (error.code === 'ER_DUP_ENTRY') { // MySQL duplicate entry error code
             // It's better if the model returns a more specific message about which field is duplicated.
            return { success: false, message: 'A student with this email, username, or contact already exists.' };
        }
        console.error('Service error adding student by admin:', error);
        return { success: false, message: error.message || 'An unexpected error occurred in service layer while adding student.' };
    }
};

// *******************************************************************
// NEW ADDITION: Service to update student profile
// *******************************************************************
const updateStudentProfile = async (stid, profileData) => {
    try {
        const updateFields = {};

        // Only include fields that are present and not empty/null
        if (profileData.name !== undefined) { // Check for undefined to allow empty string if intended
            updateFields.name = profileData.name;
        }
        if (profileData.username !== undefined) {
            updateFields.username = profileData.username;
        }
        if (profileData.contact !== undefined) {
            updateFields.contact = profileData.contact;
        }

        // Handle password update if newPassword is provided and valid (already hashed in controller)
        if (profileData.password) { // This `password` should already be the HASHED password from the controller
            updateFields.password = profileData.password;
        }

        if (Object.keys(updateFields).length === 0) {
            return { success: false, message: 'No valid fields provided for update.' };
        }

        const result = await regModels.updateStudentProfileById(stid, updateFields);
        return result; // This result will contain success and message from the model
    } catch (error) {
        console.error('regServices: Error in updateStudentProfile:', error);
        // The model already handles ER_DUP_ENTRY for specific fields, so just re-throw or return generic error
        return { success: false, message: 'An error occurred while updating the profile.' };
    }
};


// --- Admin Services ---

const registerAdmin = async (fullName, password, email, contact, role = 'admin') => {
    try {
        const existingAdmin = await regModels.findAdminByEmail(email);
        if (existingAdmin) {
            return { success: false, message: "Admin with this email already exists." };
        }
        const existingAdminContact = await regModels.findAdminByContact(contact);
        if (existingAdminContact) {
            return { success: false, message: "Admin with this contact number already exists." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const emailOtp = generateOtp();
        const emailOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        const contactOtp = generateOtp();
        const contactOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        const result = await regModels.saveAdminWithDualOtp(fullName, hashedPassword, email, contact, role, emailOtp, emailOtpExpiresAt, contactOtp, contactOtpExpiresAt);

        if (result.affectedRows === 1) {
            await sendOtp(email, emailOtp, 'email'); // Send email OTP
            await sendOtp(contact, contactOtp, 'sms'); // Send SMS OTP
            return { success: true, message: "Admin registration successful. Please verify your email and contact number.", email: email, contact: contact };
        } else {
            return { success: false, message: "Admin registration failed." };
        }
    } catch (error) {
        console.error("Error registering admin:", error);
        return { success: false, message: "An error occurred during admin registration." };
    }
};


const verifyAdminOtp = async (identifier, otp, type) => { // identifier can be email or contact
    try {
        let user;
        if (type === 'email') {
            user = await regModels.findAdminByEmailAndEmailOtp(identifier, otp);
        } else if (type === 'contact') {
            user = await regModels.findAdminByContactAndContactOtp(identifier, otp);
        } else {
            return { success: false, message: "Invalid verification type." };
        }

        if (!user) {
            return { success: false, message: "Invalid OTP or identifier." };
        }

        const otpExpiresAt = type === 'email' ? user.email_otp_expires_at : user.contact_otp_expires_at;
        if (new Date() > new Date(otpExpiresAt)) {
            return { success: false, message: "OTP has expired. Please request a new one." };
        }

        if (type === 'email') {
            await regModels.updateAdminEmailVerification(user.id);
            return { success: true, message: "Email verified successfully!" };
        } else {
            await regModels.updateAdminContactVerification(user.id);
            return { success: true, message: "Contact verified successfully!" };
        }

    } catch (error) {
        console.error("Error verifying admin OTP:", error);
        return { success: false, message: "An error occurred during verification." };
    }
};

const resendAdminOtp = async (identifier, type) => { // identifier can be email or contact
    try {
        const admin = type === 'email' ? await regModels.findAdminByEmail(identifier) : await regModels.findAdminByContact(identifier);

        if (!admin) {
            return { success: false, message: `Admin with this ${type} not found.` };
        }

        const newOtp = generateOtp();
        const newOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        if (type === 'email') {
            await regModels.updateAdminEmailOtpForResend(admin.id, newOtp, newOtpExpiresAt);
            await sendOtp(identifier, newOtp, 'email');
            return { success: true, message: "New email OTP sent to admin successfully." };
        } else { // type === 'contact'
            await regModels.updateAdminContactOtpForResend(admin.id, newOtp, newOtpExpiresAt);
            await sendOtp(identifier, newOtp, 'sms');
            return { success: true, message: "New SMS OTP sent to admin successfully." };
        }

    } catch (error) {
        console.error("Error resending admin OTP:", error);
        return { success: false, message: "An error occurred while resending admin OTP." };
    }
};

const loginAdmin = async (email, password) => {
    try {
        const admin = await regModels.findAdminByEmail(email);
        if (!admin) {
            return { success: false, message: "Admin not found." };
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return { success: false, message: "Incorrect password." };
        }

        // Check verification status
        if (!admin.is_email_verified || !admin.is_contact_verified) {
            let message = "Please verify your account.";
            if (!admin.is_email_verified) {
                message += " Email needs verification.";
                const newOtp = generateOtp();
                const newOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
                await regModels.updateAdminEmailOtpForResend(admin.id, newOtp, newOtpExpiresAt);
                await sendOtp(admin.email, newOtp, 'email');
            }
            if (!admin.is_contact_verified) {
                message += " Contact needs verification.";
                const newOtp = generateOtp();
                const newOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
                await regModels.updateAdminContactOtpForResend(admin.id, newOtp, newOtpExpiresAt);
                await sendOtp(admin.contact, newOtp, 'sms');
            }
            return { success: false, message: message, requiresVerification: true, email: admin.email, contact: admin.contact, isAdmin: true };
        }

        return { success: true, message: "Admin login successful!", user: admin };
    } catch (error) {
        console.error("Error logging in admin:", error);
        return { success: false, message: "An error occurred during login." };
    }
};

module.exports = {
    registerStudent,
    verifyStudentOtp,
    resendStudentOtp,
    loginStudent,
    addStudentByAdmin,
    updateStudentProfile, // <-- NEWLY ADDED EXPORT FOR STUDENT PROFILE UPDATE
    registerAdmin,
    verifyAdminOtp,
    resendAdminOtp,
    loginAdmin
};