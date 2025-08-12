// services/studentService.js
const scheduleModels = require('../models/scheduleModels');
const studentModels = require('../models/regModels'); // Assuming regModels has student-related functions

const getStudentExamSchedule = async (studentId) => {
    try {
        // You can fetch student details if needed for specific filtering (e.g., by branch, year)
        // const studentResult = await studentModels.getStudentById(studentId);
        // if (!studentResult.success || !studentResult.student) {
        //     return { success: false, message: 'Student not found.' };
        // }
        // const student = studentResult.student;

        // For now, let's fetch all schedules.
        // In a real application, you might filter schedules based on the student's course, branch, year, etc.
        // This would require having those fields in your Exam or Subject tables,
        // and modifying the getAllSchedules or creating a new model function.

        const schedulesResult = await scheduleModels.getAllSchedules();

        if (!schedulesResult.success) {
            return { success: false, message: schedulesResult.message || 'Failed to retrieve schedules.' };
        }

        // Optional: Filter schedules based on future dates
        const now = new Date();
        const filteredSchedules = schedulesResult.schedules.filter(schedule => {
            const scheduleDateTime = new Date(`${schedule.date}T${schedule.starttime}`);
            return scheduleDateTime > now;
        });

        // Sort schedules by date and then by start time
        filteredSchedules.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
                return dateA - dateB;
            }
            // If dates are the same, compare times
            const timeA = a.starttime;
            const timeB = b.starttime;
            return timeA.localeCompare(timeB);
        });


        return { success: true, schedules: filteredSchedules };
    } catch (error) {
        console.error('Error in getStudentExamSchedule:', error.message);
        return { success: false, message: 'An error occurred while fetching schedules.' };
    }
};

module.exports = {
    getStudentExamSchedule
};