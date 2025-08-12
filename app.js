// D:\Exam-App\src\app.js
const express = require('express');
const path = require('path');
const session = require('express-session'); // REQUIRED for sessions
const flash = require('connect-flash');     // REQUIRED for flash messages

// Corrected require paths (assuming routes and controllers are directly inside 'src')
const regRoutes = require('./routes/regRoutes'); // Correct: assuming D:\Exam-App\src\routes\regRoutes.js

// Import controllers (assuming they are in D:\Exam-App\src\controllers)
const examController = require('./controllers/examController'); // Correct: D:\Exam-App\src\controllers\examController.js
const regController = require('./controllers/regCtrl');     // Correct: D:\Exam-App\src\controllers\regCtrl.js

// NEW: Import student controller and routes
const studentController = require('./controllers/studentController'); // NEW: D:\Exam-App\src\controllers\studentController.js
const studentRoutes = require('./routes/studentRoutes');     // NEW: D:\Exam-App\src\routes\studentRoutes.js

// NEW: Import middleware from the dedicated authMiddleware.js file
const { isLoggedIn, isAdmin } = require('./middleware/authMiddleware'); // <--- ADD THIS LINE

const app = express(); // Initialize Express app

// Configure Express to parse request bodies
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Serve static files from the 'public' directory
// Assumes 'public' is in the project root (D:\Exam-App\public)
app.use(express.static(path.join(__dirname, '..', 'public'))); // Correct: 'public' is sibling to 'src'

// --- IMPORTANT: Session middleware MUST come before Flash middleware ---
app.use(session({
    secret: process.env.JWT_SECRET || 'aVeryStrongAndUniqueDefaultSecretKeyForSession', // Use env var, fallback to strong default
    resave: false, // Don't save session if unmodified
    saveUninitialized: true, // Save new sessions even if not modified
    cookie: {
        secure: false, // Set to true if your site uses HTTPS. For development (HTTP), it should be false.
        maxAge: 1000 * 60 * 60 * 24 // Session lasts 24 hours (example)
    }
}));

// Flash middleware (MUST be after session middleware)
app.use(flash());

// Middleware to make flash messages available to all templates (res.locals)
// This allows you to access 'message' and 'error' directly in your EJS files
app.use((req, res, next) => {
    res.locals.message = req.flash('message');
    res.locals.error = req.flash('error');
    // Ensure user object is also available if logged in
    res.locals.user = req.session.user || null; // Making session user available globally
    next();
});

// Set EJS as the view engine
app.set('view engine', 'ejs');
// Set the views directory. Assumes 'views' is directly inside 'D:\Exam-App' (project root).
app.set('views', path.join(__dirname, '..', 'views')); // Correct: 'views' is sibling to 'src'

// Use your routes
app.use('/', regRoutes); // For general routes like login, register, landing

// NEW: Handle the specific /adminHome route directly
// This must come before app.use('/admin', adminRoutes) to take precedence for /adminHome
app.get('/adminHome', isLoggedIn, isAdmin, regController.getAdminHomePage); // <--- ADD THIS LINE

// Import and mount admin routes (assuming D:\Exam-App\src\routes\adminRoutes.js)
const adminRoutes = require('./routes/adminRoutes'); // Correct path
app.use('/admin', adminRoutes); // Mount admin routes under /admin

// NEW: Mount student routes
app.use('/student', studentRoutes); // Mount student routes under /student


// Export the app instance so it can be used by your main server file (index.js)
module.exports = app;