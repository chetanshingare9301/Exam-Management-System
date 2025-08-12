// D:\Exam-App\src\controllers\studentController.js
const studentService = require('../services/studentService'); // Make sure this path is correct

const getStudentDashboard = (req, res) => {
    res.render('studentDashboard', {
        user: req.session.user,
        message: req.flash('message'),
        error: req.flash('error')
    });
};

const getStudentSchedulePage = async (req, res) => {
    try {
        const result = await studentService.getStudentExamSchedule(req.session.user.id);

        if (result.success) {
            res.render('studentSchedule', {
                schedules: result.schedules,
                user: req.session.user,
                message: null,
                error: null
            });
        } else {
            res.render('studentSchedule', {
                schedules: [],
                user: req.session.user,
                error: result.message,
                message: null
            });
        }
    } catch (error) {
        console.error('Error loading student schedule page:', error);
        res.render('studentSchedule', {
            schedules: [],
            user: req.session.user,
            error: 'Failed to load exam schedules.',
            message: null
        });
    }
};

const getStudentProfile = (req, res) => {
    res.render('studentProfile', {
        user: req.session.user,
        message: req.flash('message'),
        error: req.flash('error')
    });
};

// --- NEW PLACEHOLDER FUNCTIONS FOR PROFILE MANAGEMENT ---
const getEditStudentProfile = (req, res) => {
    // You'd fetch the student's current profile data here to pre-fill the form
    res.render('editStudentProfile', {
        user: req.session.user,
        message: req.flash('message'),
        error: req.flash('error')
    });
};

const postEditStudentProfile = (req, res) => {
    // Logic to update student profile in the database
    // req.body will contain the form data
    req.flash('message', 'Profile updated successfully!');
    res.redirect('/student/profile'); // Redirect back to profile page after update
};

// --- NEW PLACEHOLDER FUNCTIONS FOR EXAMS & NOTICES ---
const getStudentExamsPage = (req, res) => {
    // Logic to fetch exams the student has taken or is registered for
    res.render('studentExams', {
        user: req.session.user,
        message: req.flash('message'),
        error: req.flash('error')
    });
};

const getEnrollExamsPage = (req, res) => {
    // Logic to fetch available exams for enrollment
    res.render('enrollExams', {
        user: req.session.user,
        message: req.flash('message'),
        error: req.flash('error')
    });
};

const getStudentNoticesPage = (req, res) => {
    // Logic to fetch notices relevant to students
    res.render('studentNotices', {
        user: req.session.user,
        message: req.flash('message'),
        error: req.flash('error')
    });
};


module.exports = {
    getStudentDashboard,
    getStudentSchedulePage,
    getStudentProfile,
    // NEW: Export the newly defined functions
    getEditStudentProfile,
    postEditStudentProfile,
    getStudentExamsPage,
    getEnrollExamsPage,
    getStudentNoticesPage
};