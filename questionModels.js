// models/questionModels.js
const { pool } = require('../config/db');

// Function to create a new question
const createQuestion = async (question, option1, option2, option3, option4, answer) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO Question (question, option1, option2, option3, option4, answer) VALUES (?, ?, ?, ?, ?, ?)',
            [question, option1, option2, option3, option4, answer]
        );
        return { success: true, qid: result.insertId };
    } catch (error) {
        console.error('Error creating question:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, message: 'A question with this text already exists.' };
        }
        return { success: false, message: 'Failed to create question.' };
    }
};

// Function to get all questions
const getAllQuestions = async () => {
    try {
        const [rows] = await pool.query('SELECT * FROM Question');
        return { success: true, questions: rows };
    } catch (error) {
        console.error('Error getting all questions:', error.message);
        return { success: false, message: 'Failed to retrieve questions.' };
    }
};

// Function to get a single question by ID
const getQuestionById = async (qid) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Question WHERE qid = ?', [qid]);
        return { success: true, question: rows[0] || null };
    } catch (error) {
        console.error('Error getting question by ID:', error.message);
        return { success: false, message: 'Failed to retrieve question.' };
    }
};

// Function to update a question
const updateQuestion = async (qid, { question, option1, option2, option3, option4, answer }) => {
    try {
        const [result] = await pool.query(
            'UPDATE Question SET question = ?, option1 = ?, option2 = ?, option3 = ?, option4 = ?, answer = ? WHERE qid = ?',
            [question, option1, option2, option3, option4, answer, qid]
        );
        if (result.affectedRows === 0) {
            return { success: false, message: 'Question not found or no changes made.' };
        }
        return { success: true, message: 'Question updated successfully.' };
    } catch (error) {
        console.error('Error updating question:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, message: 'A question with this text already exists.' };
        }
        return { success: false, message: 'Failed to update question.' };
    }
};

// Function to delete a question
const deleteQuestion = async (qid) => {
    try {
        const [result] = await pool.query('DELETE FROM Question WHERE qid = ?', [qid]);
        if (result.affectedRows === 0) {
            return { success: false, message: 'Question not found.' };
        }
        return { success: true, message: 'Question deleted successfully.' };
    } catch (error) {
        console.error('Error deleting question:', error.message);
        return { success: false, message: 'Failed to delete question.' };
    }
};

module.exports = {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
};