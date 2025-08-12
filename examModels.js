// models/examModels.js
const { pool } = require('../config/db');

// Function to create a new exam
const createExam = async (examname, totalmarks, passingmarks) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO Exam (examname, totalmarks, passingmarks) VALUES (?, ?, ?)',
            [examname, totalmarks, passingmarks]
        );
        return { success: true, examId: result.insertId };
    } catch (error) {
        console.error('Error creating exam:', error.message);
        // Check for duplicate entry error specifically
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, message: 'An exam with this name already exists.' };
        }
        return { success: false, message: 'Failed to create exam.' };
    }
};

// Function to get all exams
const getAllExams = async () => {
    try {
        const [rows] = await pool.query('SELECT * FROM Exam');
        return { success: true, exams: rows };
    } catch (error) {
        console.error('Error getting all exams:', error.message);
        return { success: false, message: 'Failed to retrieve exams.' };
    }
};

// Function to get a single exam by ID
const getExamById = async (examid) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Exam WHERE examid = ?', [examid]);
        return { success: true, exam: rows[0] || null };
    } catch (error) {
        console.error('Error getting exam by ID:', error.message);
        return { success: false, message: 'Failed to retrieve exam.' };
    }
};

// Function to update an exam
const updateExam = async (examid, { examname, totalmarks, passingmarks }) => {
    try {
        const [result] = await pool.query(
            'UPDATE Exam SET examname = ?, totalmarks = ?, passingmarks = ? WHERE examid = ?',
            [examname, totalmarks, passingmarks, examid]
        );
        if (result.affectedRows === 0) {
            return { success: false, message: 'Exam not found or no changes made.' };
        }
        return { success: true, message: 'Exam updated successfully.' };
    } catch (error) {
        console.error('Error updating exam:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, message: 'An exam with this name already exists.' };
        }
        return { success: false, message: 'Failed to update exam.' };
    }
};

// Function to delete an exam
const deleteExam = async (examid) => {
    try {
        const [result] = await pool.query('DELETE FROM Exam WHERE examid = ?', [examid]);
        if (result.affectedRows === 0) {
            return { success: false, message: 'Exam not found.' };
        }
        return { success: true, message: 'Exam deleted successfully.' };
    } catch (error) {
        console.error('Error deleting exam:', error.message);
        return { success: false, message: 'Failed to delete exam.' };
    }
};

module.exports = {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam
};