// D:\Exam-App\src\routes\adminRoutes.js
const express = require('express');
const router = express.Router();

// Corrected paths for controllers (assuming they are in src/controllers)
const examController = require('../controllers/examController');
const regController = require('../controllers/regCtrl'); // For general admin handlers, if any remain here (e.g., admin home)

// NEW: Import middleware from the dedicated authMiddleware.js file
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');

// Admin Dashboard/Home
// NOTE: I'm calling it '/dashboard' here, but it will be accessed as '/admin/dashboard'
// Or if your main admin page is still '/adminHome' as per some EJS, use that path.
router.get('/dashboard', isLoggedIn, isAdmin, regController.getAdminHomePage); // Assuming regController handles this. Rename to getAdminDashboardPage if applicable.
router.get('/', isLoggedIn, isAdmin, regController.getAdminHomePage); // Also redirect '/' to dashboard within /admin route

// --- Student Management Routes (Moved from regRoutes.js) ---
// These were originally "/admin/addstudent", "/admin/viewstudents" etc.
// Since this router is mounted at "/admin", these paths become "/addstudent", "/viewstudents" etc.
router.get('/addstudent', isLoggedIn, isAdmin, regController.getAddStudentPage);
router.post('/addstudent', isLoggedIn, isAdmin, regController.postAddStudent);
router.get('/viewstudents', isLoggedIn, isAdmin, regController.getStudentsViewPage);
// If you have edit/delete student routes, add them here with middleware:
// router.get('/editstudent/:id', isLoggedIn, isAdmin, regController.getEditStudentPage);
// router.post('/editstudent/:id', isLoggedIn, isAdmin, regController.postEditStudent);
// router.post('/deletestudent/:id', isLoggedIn, isAdmin, regController.deleteStudent);


// --- Exam Management Routes ---
router.get('/exams/add', isLoggedIn, isAdmin, examController.getAddExamPage);
router.post('/exams/add', isLoggedIn, isAdmin, examController.postAddExam);
router.get('/exams/view', isLoggedIn, isAdmin, examController.getViewExamsPage);
router.get('/exams/edit/:examid', isLoggedIn, isAdmin, examController.getEditExamPage);
router.post('/exams/edit/:examid', isLoggedIn, isAdmin, examController.postEditExam);
router.post('/exams/delete/:examid', isLoggedIn, isAdmin, examController.deleteExam);

// --- Question Management Routes ---
router.get('/questions/add', isLoggedIn, isAdmin, examController.getAddQuestionPage);
router.post('/questions/add', isLoggedIn, isAdmin, examController.postAddQuestion);
router.get('/questions/view', isLoggedIn, isAdmin, examController.getViewQuestionsPage);
router.get('/questions/edit/:qid', isLoggedIn, isAdmin, examController.getEditQuestionPage);
router.post('/questions/edit/:qid', isLoggedIn, isAdmin, examController.postEditQuestion);
router.post('/questions/delete/:qid', isLoggedIn, isAdmin, examController.deleteQuestion);

// --- Subject Management Routes (Moved from regRoutes.js) ---
router.get('/subjects/add', isLoggedIn, isAdmin, regController.getAddSubjectsPage);
router.post('/subjects/add', isLoggedIn, isAdmin, regController.addSubject);
router.get('/subjects/view', isLoggedIn, isAdmin, regController.getSubjectsViewPage);
router.get('/assign-students', isLoggedIn, isAdmin, regController.getAssignStudentsPage);
 // <--- ADD THIS LINE
 router.post('/assign-students', isLoggedIn, isAdmin, regController.postAssignStudents);
// If you have edit/delete subject routes, add them here with middleware:
// router.get('/subjects/edit/:sid', isLoggedIn, isAdmin, regController.getEditSubjectPage);
// router.post('/subjects/edit/:sid', isLoggedIn, isAdmin, regController.postEditSubject);
// router.post('/subjects/delete/:sid', isLoggedIn, isAdmin, regController.deleteSubject);


// --- Schedule Management Routes ---
router.get('/schedule/add', isLoggedIn, isAdmin, examController.getScheduleExamPage);
router.post('/schedule/add', isLoggedIn, isAdmin, examController.postScheduleExam);
router.get('/schedule/view', isLoggedIn, isAdmin, examController.getViewSchedulesPage);
router.get('/schedule/edit/:schid', isLoggedIn, isAdmin, examController.getEditSchedulePage);
router.post('/schedule/edit/:schid', isLoggedIn, isAdmin, examController.postEditSchedule);
router.post('/schedule/delete/:schid', isLoggedIn, isAdmin, examController.deleteSchedule);

// --- Notice Management Routes (Moved from regRoutes.js) ---
router.get('/notices/add', isLoggedIn, isAdmin, regController.getAddNoticePage);
router.post('/notices/add', isLoggedIn, isAdmin, regController.addNotice);
router.get('/notices/view', isLoggedIn, isAdmin, regController.getViewNoticesPage);
router.get('/notices/edit/:nid', isLoggedIn, isAdmin, regController.getEditNoticePage);
router.post('/notices/edit/:nid', isLoggedIn, isAdmin, regController.postEditNotice);
router.post('/notices/delete/:nid', isLoggedIn, isAdmin, regController.deleteNotice);

// --- Admin Profile/Password Reset (if you have one) ---
// Assuming this is handled by a regController function
router.get('/users', isLoggedIn, isAdmin, regController.getResetPasswordPage); // Or similar route

module.exports = router;