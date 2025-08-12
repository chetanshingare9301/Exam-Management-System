const express = require('express');
const router = express.Router();
const regController = require('../controllers/regCtrl'); // Corrected path from last step // Corrected path // Corrected path to be relative to src/routes

// Note: This file should primarily handle public routes (login, registration)
// All protected routes (admin and student dashboards, management pages, etc.)
// should be moved to their respective adminRoutes.js and studentRoutes.js files,
// and have the appropriate authentication/authorization middleware applied.

// Authentication & Registration Routes
router.get("/registeradmin", regController.getRegisterAdminPage); // Admin registration (public)
router.post("/registeradmin", regController.registerAdmin);     // Admin registration POST (public)
router.get("/adminlogin", regController.getAdminLoginPage);     // Admin login page (public)
router.post("/adminlogin", regController.adminLogin);         // Admin login POST (public)

router.get("/registerstudent", regController.getRegisterStudentPage); // Student registration (public)
router.post("/registerstudent", regController.registerStudent);     // Student registration POST (public)
router.get("/studentlogin", regController.getStudentLoginPage);     // Student login page (public)
router.post("/studentlogin", regController.studentLogin);         // Student login POST (public)

// OTP Verification Routes (public, as they are part of the registration/login flow)
router.get("/verify-otp", regController.getOtpVerificationPage);
router.post("/verify-otp", regController.verifyOtp);
router.post("/resend-otp", regController.resendOtp);

// Universal Logout (handles session destruction and redirects based on presumed role or default)
router.get("/logout", (req, res) => {
    // Store role before session is destroyed
    const role = req.session.user ? req.session.user.role : null;

    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/'); // Fallback if session destroy fails
        }
        res.clearCookie('connect.sid'); // Clear the session cookie from the browser
        req.flash('message', 'You have been logged out.');

        // Redirect based on the stored role
        if (role === 'admin') {
            res.redirect('/adminlogin');
        } else if (role === 'student') {
            res.redirect('/studentlogin');
        } else {
            res.redirect('/'); // Default redirect for unknown or non-existent roles
        }
    });
});

// Root/Home page (public)
router.get("/", (req, res) => {
    res.render("home"); // Assuming your main landing page is 'home.ejs'
});

module.exports = router;