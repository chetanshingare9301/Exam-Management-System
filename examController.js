// controllers/examController.js
const examService = require('../services/examService'); 
// controllers/examController.js

const examModels = require('../models/examModels'); // Needed to fetch exams for dropdown
const regModels = require('../models/regModels');   // Needed to fetch subjects for dropdown
// ... existing code ...


// Import the new service
// You might also need regModels for subjects if scheduling exams requires fetching subjects
// const regModels = require('../models/regModels');

// --- Admin Exam Management ---

const getAddExamPage = (req, res) => {
    res.render('addExam', { message: null, error: null, user: req.session.user });
};

const postAddExam = async (req, res) => {
    const { examname, totalmarks, passingmarks } = req.body;
    const result = await examService.addExam(examname, parseInt(totalmarks), parseInt(passingmarks));

    if (result.success) {
        res.render('addExam', { message: 'Exam added successfully!', error: null, user: req.session.user });
    } else {
        res.render('addExam', { error: result.message, message: null, user: req.session.user });
    }
};

const getViewExamsPage = async (req, res) => {
    const result = await examService.getExams();
    if (result.success) {
        res.render('viewExams', { exams: result.exams, message: null, error: null, user: req.session.user });
    } else {
        res.render('viewExams', { exams: [], error: result.message, message: null, user: req.session.user });
    }
};

const getEditExamPage = async (req, res) => {
    const { examid } = req.params;
    const result = await examService.getExamDetails(examid);

    if (result.success && result.exam) {
        res.render('editExam', { exam: result.exam, message: null, error: null, user: req.session.user });
    } else {
        // Redirect or render with an error if exam not found
        res.redirect('/admin/exams/view'); // Or render 'viewExams' with an error message
    }
};

const postEditExam = async (req, res) => {
    const { examid } = req.params;
    const { examname, totalmarks, passingmarks } = req.body;
    const result = await examService.updateExam(examid, examname, parseInt(totalmarks), parseInt(passingmarks));

    if (result.success) {
        res.redirect('/admin/exams/view'); // Redirect to view all exams
    } else {
        // If update failed, re-render the edit page with error
        const currentExamResult = await examService.getExamDetails(examid); // Fetch original data
        res.render('editExam', {
            exam: currentExamResult.success ? currentExamResult.exam : null,
            error: result.message,
            message: null,
            user: req.session.user
        });
    }
};

const deleteExam = async (req, res) => {
    const { examid } = req.params;
    const result = await examService.deleteExam(examid);

    if (result.success) {
        res.redirect('/admin/exams/view');
    } else {
        // If deletion failed, re-render view page with error
        const allExamsResult = await examService.getExams();
        res.render('viewExams', {
            exams: allExamsResult.success ? allExamsResult.exams : [],
            error: result.message,
            message: null,
            user: req.session.user
        });
    }
};

// --- Admin Question Management ---

const getAddQuestionPage = (req, res) => {
    res.render('addQuestion', { message: null, error: null, user: req.session.user });
};

const postAddQuestion = async (req, res) => {
    const { question, option1, option2, option3, option4, answer } = req.body;
    const result = await examService.addQuestion(question, option1, option2, option3, option4, answer);

    if (result.success) {
        res.render('addQuestion', { message: 'Question added successfully!', error: null, user: req.session.user });
    } else {
        res.render('addQuestion', { error: result.message, message: null, user: req.session.user });
    }
};

const getViewQuestionsPage = async (req, res) => {
    const result = await examService.getQuestions();
    if (result.success) {
        res.render('viewQuestions', { questions: result.questions, message: null, error: null, user: req.session.user });
    } else {
        res.render('viewQuestions', { questions: [], error: result.message, message: null, user: req.session.user });
    }
};

const getEditQuestionPage = async (req, res) => {
    const { qid } = req.params;
    const result = await examService.getQuestionDetails(qid);

    if (result.success && result.question) {
        res.render('editQuestion', { question: result.question, message: null, error: null, user: req.session.user });
    } else {
        res.redirect('/admin/questions/view');
    }
};

const postEditQuestion = async (req, res) => {
    const { qid } = req.params;
    const { question, option1, option2, option3, option4, answer } = req.body;
    const result = await examService.updateQuestion(qid, question, option1, option2, option3, option4, answer);

    if (result.success) {
        res.redirect('/admin/questions/view');
    } else {
        const currentQuestionResult = await examService.getQuestionDetails(qid);
        res.render('editQuestion', {
            question: currentQuestionResult.success ? currentQuestionResult.question : null,
            error: result.message,
            message: null,
            user: req.session.user
        });
    }
};

const deleteQuestion = async (req, res) => {
    const { qid } = req.params;
    const result = await examService.deleteQuestion(qid);

    if (result.success) {
        res.redirect('/admin/questions/view');
    } else {
        const allQuestionsResult = await examService.getQuestions();
        res.render('viewQuestions', {
            questions: allQuestionsResult.success ? allQuestionsResult.questions : [],
            error: result.message,
            message: null,
            user: req.session.user
        });
    }
};

// controllers/examController.js (add these new functions)

// --- Admin Schedule Management ---

const getScheduleExamPage = async (req, res) => {
    try {
        const examsResult = await examModels.getAllExams();
        const subjectsResult = await regModels.getSubjects(); // Assuming getSubjects is in regModels

        if (!examsResult.success || !subjectsResult.success) {
            return res.render('scheduleExam', {
                exams: [],
                subjects: [],
                error: examsResult.message || subjectsResult.message,
                message: null,
                user: req.session.user
            });
        }

        res.render('scheduleExam', {
            exams: examsResult.exams,
            subjects: subjectsResult.subjects,
            message: null,
            error: null,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading schedule exam page:', error);
        res.render('scheduleExam', {
            exams: [],
            subjects: [],
            error: 'Failed to load data for scheduling.',
            message: null,
            user: req.session.user
        });
    }
};

const postScheduleExam = async (req, res) => {
    const { examid, sid, date, starttime, endtime } = req.body;
    const result = await examService.scheduleExam(
        parseInt(examid),
        parseInt(sid),
        date,
        starttime,
        endtime
    );

    if (result.success) {
        res.render('scheduleExam', {
            exams: (await examModels.getAllExams()).exams, // Re-fetch for dropdown
            subjects: (await regModels.getSubjects()).subjects, // Re-fetch for dropdown
            message: 'Exam scheduled successfully!',
            error: null,
            user: req.session.user
        });
    } else {
        res.render('scheduleExam', {
            exams: (await examModels.getAllExams()).exams,
            subjects: (await regModels.getSubjects()).subjects,
            error: result.message,
            message: null,
            user: req.session.user
        });
    }
};

const getViewSchedulesPage = async (req, res) => {
    const result = await examService.getSchedules();
    if (result.success) {
        res.render('viewSchedules', { schedules: result.schedules, message: null, error: null, user: req.session.user });
    } else {
        res.render('viewSchedules', { schedules: [], error: result.message, message: null, user: req.session.user });
    }
};

const getEditSchedulePage = async (req, res) => {
    const { schid } = req.params;
    try {
        const scheduleResult = await examService.getScheduleDetails(schid);
        const examsResult = await examModels.getAllExams();
        const subjectsResult = await regModels.getSubjects();

        if (scheduleResult.success && scheduleResult.schedule && examsResult.success && subjectsResult.success) {
            res.render('editSchedule', {
                schedule: scheduleResult.schedule,
                exams: examsResult.exams,
                subjects: subjectsResult.subjects,
                message: null,
                error: null,
                user: req.session.user
            });
        } else {
            res.redirect('/admin/schedule/view'); // Or render with an error
        }
    } catch (error) {
        console.error('Error loading edit schedule page:', error);
        res.redirect('/admin/schedule/view');
    }
};

const postEditSchedule = async (req, res) => {
    const { schid } = req.params;
    const { examid, sid, date, starttime, endtime } = req.body;
    const result = await examService.updateSchedule(
        schid,
        parseInt(examid),
        parseInt(sid),
        date,
        starttime,
        endtime
    );

    if (result.success) {
        res.redirect('/admin/schedule/view');
    } else {
        // Re-render edit page with error
        try {
            const currentScheduleResult = await examService.getScheduleDetails(schid);
            const examsResult = await examModels.getAllExams();
            const subjectsResult = await regModels.getSubjects();
            res.render('editSchedule', {
                schedule: currentScheduleResult.success ? currentScheduleResult.schedule : null,
                exams: examsResult.success ? examsResult.exams : [],
                subjects: subjectsResult.success ? subjectsResult.subjects : [],
                error: result.message,
                message: null,
                user: req.session.user
            });
        } catch (fetchError) {
            console.error('Error re-fetching data for edit schedule:', fetchError);
            res.redirect('/admin/schedule/view'); // Fallback if re-fetch fails
        }
    }
};

const deleteSchedule = async (req, res) => {
    const { schid } = req.params;
    const result = await examService.deleteSchedule(schid);

    if (result.success) {
        res.redirect('/admin/schedule/view');
    } else {
        // Re-render view page with error
        const allSchedulesResult = await examService.getSchedules();
        res.render('viewSchedules', {
            schedules: allSchedulesResult.success ? allSchedulesResult.schedules : [],
            error: result.message,
            message: null,
            user: req.session.user
        });
    }
};

// --- Update your module.exports to include new functions ---
module.exports = {
    // Existing Exam operations
    getAddExamPage,
    postAddExam,
    getViewExamsPage,
    getEditExamPage,
    postEditExam,
    deleteExam,

    // Existing Question operations
    getAddQuestionPage,
    postAddQuestion,
    getViewQuestionsPage,
    getEditQuestionPage,
    postEditQuestion,
    deleteQuestion,

    // NEW Schedule operations
    getScheduleExamPage,
    postScheduleExam,
    getViewSchedulesPage,
    getEditSchedulePage,
    postEditSchedule,
    deleteSchedule
};

// module.exports = {
//     getAddExamPage,
//     postAddExam,
//     getViewExamsPage,
//     getEditExamPage,
//     postEditExam,
//     deleteExam,
//     getAddQuestionPage,
//     postAddQuestion,
//     getViewQuestionsPage,
//     getEditQuestionPage,
//     postEditQuestion,
//     deleteQuestion
// };