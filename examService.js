// services/examService.js
const examModels = require('../models/examModels');
const questionModels = require('../models/questionModels');

// --- Exam Operations ---

const addExam = async (examname, totalmarks, passingmarks) => {
    if (!examname || !totalmarks || !passingmarks) {
        return { success: false, message: 'All exam fields are required.' };
    }
    if (totalmarks <= 0 || passingmarks <= 0 || passingmarks > totalmarks) {
        return { success: false, message: 'Invalid marks values.' };
    }
    return await examModels.createExam(examname, totalmarks, passingmarks);
};

const getExams = async () => {
    return await examModels.getAllExams();
};

const getExamDetails = async (examid) => {
    if (!examid) {
        return { success: false, message: 'Exam ID is required.' };
    }
    return await examModels.getExamById(examid);
};

const updateExam = async (examid, examname, totalmarks, passingmarks) => {
    if (!examid || !examname || !totalmarks || !passingmarks) {
        return { success: false, message: 'All exam fields are required for update.' };
    }
    if (totalmarks <= 0 || passingmarks <= 0 || passingmarks > totalmarks) {
        return { success: false, message: 'Invalid marks values for update.' };
    }
    return await examModels.updateExam(examid, { examname, totalmarks, passingmarks });
};

const deleteExam = async (examid) => {
    if (!examid) {
        return { success: false, message: 'Exam ID is required for deletion.' };
    }
    return await examModels.deleteExam(examid);
};

// --- Question Operations ---

const addQuestion = async (question, option1, option2, option3, option4, answer) => {
    if (!question || !option1 || !option2 || !option3 || !option4 || !answer) {
        return { success: false, message: 'All question fields are required.' };
    }
    // Basic validation that answer is one of the options
    const options = [option1, option2, option3, option4];
    if (!options.includes(answer)) {
        return { success: false, message: 'The answer must be one of the provided options.' };
    }
    return await questionModels.createQuestion(question, option1, option2, option3, option4, answer);
};

const getQuestions = async () => {
    return await questionModels.getAllQuestions();
};

const getQuestionDetails = async (qid) => {
    if (!qid) {
        return { success: false, message: 'Question ID is required.' };
    }
    return await questionModels.getQuestionById(qid);
};

const updateQuestion = async (qid, question, option1, option2, option3, option4, answer) => {
    if (!qid || !question || !option1 || !option2 || !option3 || !option4 || !answer) {
        return { success: false, message: 'All question fields are required for update.' };
    }
    const options = [option1, option2, option3, option4];
    if (!options.includes(answer)) {
        return { success: false, message: 'The answer must be one of the provided options.' };
    }
    return await questionModels.updateQuestion(qid, { question, option1, option2, option3, option4, answer });
};

const deleteQuestion = async (qid) => {
    if (!qid) {
        return { success: false, message: 'Question ID is required for deletion.' };
    }
    return await questionModels.deleteQuestion(qid);
};


// services/examService.js (add these new functions)
const scheduleModels = require('../models/scheduleModels'); // NEW import

// --- Schedule Operations ---

const scheduleExam = async (examid, sid, date, starttime, endtime) => {
    if (!examid || !sid || !date || !starttime || !endtime) {
        return { success: false, message: 'All schedule fields are required.' };
    }

    // Basic date/time validation (can be enhanced)
    const scheduledDate = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time for comparison

    if (scheduledDate < now) {
        return { success: false, message: 'Scheduled date cannot be in the past.' };
    }

    // You might want to add more complex validation here:
    // - Check for overlapping schedules for the same exam/subject
    // - Check if examid and sid actually exist in their respective tables (though foreign keys handle integrity, pre-checks improve UX)

    return await scheduleModels.createSchedule(examid, sid, date, starttime, endtime);
};

const getSchedules = async () => {
    return await scheduleModels.getAllSchedules();
};

const getScheduleDetails = async (schid) => {
    if (!schid) {
        return { success: false, message: 'Schedule ID is required.' };
    }
    return await scheduleModels.getScheduleById(schid);
};

const updateSchedule = async (schid, examid, sid, date, starttime, endtime) => {
    if (!schid || !examid || !sid || !date || !starttime || !endtime) {
        return { success: false, message: 'All schedule fields are required for update.' };
    }

    const scheduledDate = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (scheduledDate < now) {
        return { success: false, message: 'Scheduled date cannot be in the past.' };
    }

    return await scheduleModels.updateSchedule(schid, { examid, sid, date, starttime, endtime });
};

const deleteSchedule = async (schid) => {
    if (!schid) {
        return { success: false, message: 'Schedule ID is required for deletion.' };
    }
    return await scheduleModels.deleteSchedule(schid);
};

// --- Update your module.exports to include new functions ---
module.exports = {
    // Existing Exam operations
    addExam,
    getExams,
    getExamDetails,
    updateExam,
    deleteExam,

    // Existing Question operations
    addQuestion,
    getQuestions,
    getQuestionDetails,
    updateQuestion,
    deleteQuestion,

    // NEW Schedule operations
    scheduleExam,
    getSchedules,
    getScheduleDetails,
    updateSchedule,
    deleteSchedule
};

// module.exports = {
//     addExam,
//     getExams,
//     getExamDetails,
//     updateExam,
//     deleteExam,
//     addQuestion,
//     getQuestions,
//     getQuestionDetails,
//     updateQuestion,
//     deleteQuestion
// };