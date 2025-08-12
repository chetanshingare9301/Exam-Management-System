// models/scheduleModels.js
const { pool } = require('../config/db');

// Function to create a new exam schedule
const createSchedule = async (examid, sid, date, starttime, endtime) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO Schedule (examid, sid, date, starttime, endtime) VALUES (?, ?, ?, ?, ?)',
            [examid, sid, date, starttime, endtime]
        );
        return { success: true, schid: result.insertId };
    } catch (error) {
        console.error('Error creating schedule:', error.message);
        return { success: false, message: 'Failed to create schedule.' };
    }
};

// Function to get all schedules, joining with Exam and Subject names
const getAllSchedules = async () => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.schid, 
                e.examname, 
                sub.subjectname, 
                s.date, 
                s.starttime, 
                s.endtime,
                s.examid,
                s.sid
            FROM Schedule s
            JOIN Exam e ON s.examid = e.examid
            JOIN subject sub ON s.sid = sub.sid
            ORDER BY s.date DESC, s.starttime ASC
        `);
        return { success: true, schedules: rows };
    } catch (error) {
        console.error('Error getting all schedules:', error.message);
        return { success: false, message: 'Failed to retrieve schedules.' };
    }
};

// Function to get a single schedule by ID
const getScheduleById = async (schid) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.schid, 
                e.examname, 
                sub.subjectname, 
                s.date, 
                s.starttime, 
                s.endtime,
                s.examid,
                s.sid
            FROM Schedule s
            JOIN Exam e ON s.examid = e.examid
            JOIN subject sub ON s.sid = sub.sid
            WHERE s.schid = ?
        `, [schid]);
        return { success: true, schedule: rows[0] || null };
    } catch (error) {
        console.error('Error getting schedule by ID:', error.message);
        return { success: false, message: 'Failed to retrieve schedule.' };
    }
};

// Function to update an existing schedule
const updateSchedule = async (schid, { examid, sid, date, starttime, endtime }) => {
    try {
        const [result] = await pool.query(
            'UPDATE Schedule SET examid = ?, sid = ?, date = ?, starttime = ?, endtime = ? WHERE schid = ?',
            [examid, sid, date, starttime, endtime, schid]
        );
        if (result.affectedRows === 0) {
            return { success: false, message: 'Schedule not found or no changes made.' };
        }
        return { success: true, message: 'Schedule updated successfully.' };
    } catch (error) {
        console.error('Error updating schedule:', error.message);
        return { success: false, message: 'Failed to update schedule.' };
    }
};

// Function to delete a schedule
const deleteSchedule = async (schid) => {
    try {
        const [result] = await pool.query('DELETE FROM Schedule WHERE schid = ?', [schid]);
        if (result.affectedRows === 0) {
            return { success: false, message: 'Schedule not found.' };
        }
        return { success: true, message: 'Schedule deleted successfully.' };
    } catch (error) {
        console.error('Error deleting schedule:', error.message);
        return { success: false, message: 'Failed to delete schedule.' };
    }
};

module.exports = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule
};