// D:\Exam-App\src\routes\studentRoutes.js
const express = require('express');
const router = express.Router();

// Corrected path for studentController (assuming it's in src/controllers)
const studentController = require('../controllers/studentController');
// NEW: Import middleware from the dedicated authMiddleware.js file
const { isLoggedIn, isStudent } = require('../middleware/authMiddleware');

// Student Dashboard
// Since this router is mounted at "/student" in app.js,
// router.get('/dashboard') will be accessed as '/student/dashboard'
router.get('/dashboard', isLoggedIn, isStudent, studentController.getStudentDashboard);
router.get('/', isLoggedIn, isStudent, studentController.getStudentDashboard); // Also redirect '/' within /student to dashboard

// Route to view exam schedules for students
router.get('/schedule', isLoggedIn, isStudent, studentController.getStudentSchedulePage);

// --- Student Profile Management Routes (Moved from regRoutes.js) ---
// These were originally "/student/profile", "/student/profile/edit" etc.
// Since this router is mounted at "/student", these paths become "/profile", "/profile/edit" etc.
router.get('/profile', isLoggedIn, isStudent, studentController.getStudentProfile); // Assuming studentController handles this
router.get('/profile/edit', isLoggedIn, isStudent, studentController.getEditStudentProfile); // Assuming studentController handles this
router.post('/profile/edit', isLoggedIn, isStudent, studentController.postEditStudentProfile); // Assuming studentController handles this

// --- Student Exam & Notice Views (Moved from regRoutes.js) ---
router.get('/myexams', isLoggedIn, isStudent, studentController.getStudentExamsPage); // Assuming studentController handles this
router.get('/enroll-exams', isLoggedIn, isStudent, studentController.getEnrollExamsPage); // Assuming studentController handles this
router.get('/notices', isLoggedIn, isStudent, studentController.getStudentNoticesPage); // Assuming studentController handles this


// Add other student-specific routes here (e.g., taking exam, viewing results)
// router.get('/take-exam/:examId', isLoggedIn, isStudent, studentController.getTakeExamPage);
// router.post('/submit-exam/:examId', isLoggedIn, isStudent, studentController.submitExam);
// router.get('/results', isLoggedIn, isStudent, studentController.getStudentResultsPage);


module.exports = router;