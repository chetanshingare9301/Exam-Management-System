// D:\Exam-App\src\middleware\authMiddleware.js

// Middleware to check if the user is authenticated (logged in)
const isLoggedIn = (req, res, next) => {
    // Check if user information exists in the session
    // req.session.user should be set during a successful login
    if (req.session.user) {
        return next(); // User is logged in, proceed to the next middleware/route handler
    }
    // If not logged in, set a flash error message and redirect to the login page
    req.flash('error', 'Please log in to view that resource.');
    res.redirect('/login'); // Redirect to your login page URL
};

// Middleware to check if the logged-in user is an Admin
const isAdmin = (req, res, next) => {
    // This assumes req.session.user.role is set during successful admin login
    // And that 'admin' is the exact string used for administrator accounts
    if (req.session.user && req.session.user.role === 'admin') {
        return next(); // User is an admin, proceed
    }
    // If not an admin or not logged in as admin, prevent access
    req.flash('error', 'You are not authorized to access this section.');
    // Redirect based on current context:
    if (req.session.user && req.session.user.role === 'student') {
        res.redirect('/student/dashboard'); // If a student tries to access admin
    } else {
        res.redirect('/login'); // If not logged in or wrong role
    }
};

// Middleware to check if the logged-in user is a Student
const isStudent = (req, res, next) => {
    // This assumes req.session.user.role is set during successful student login
    // And that 'student' is the exact string used for student accounts
    if (req.session.user && req.session.user.role === 'student') {
        return next(); // User is a student, proceed
    }
    // If not a student or not logged in as student, prevent access
    req.flash('error', 'You are not authorized to access this section.');
    // Redirect based on current context:
    if (req.session.user && req.session.user.role === 'admin') {
        res.redirect('/adminHome'); // If an admin tries to access student
    } else {
        res.redirect('/login'); // If not logged in or wrong role
    }
};

module.exports = {
    isLoggedIn,
    isAdmin,
    isStudent
};