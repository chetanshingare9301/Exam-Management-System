const { pool } = require('../config/db');

// --- Student Operations ---

// Saves student with BOTH OTPs and their expiry
const saveStudentWithDualOtp = async (name, password, email, contact, username, emailOtp, emailOtpExpiresAt, contactOtp, contactOtpExpiresAt) => {
    const [result] = await pool.execute(
        'INSERT INTO student (name, password, email, contact, username, email_otp, email_otp_expires_at, is_email_verified, contact_otp, contact_otp_expires_at, is_contact_verified) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, ?, ?, FALSE)',
        [name, password, email, contact, username, emailOtp, emailOtpExpiresAt, contactOtp, contactOtpExpiresAt]
    );
    return result;
};

// Finds a student by email and email OTP
const findStudentByEmailAndEmailOtp = async (email, otp) => {
    const [rows] = await pool.execute(
        'SELECT * FROM student WHERE email = ? AND email_otp = ?',
        [email, otp]
    );
    return rows[0];
};

// Finds a student by contact and contact OTP
const findStudentByContactAndContactOtp = async (contact, otp) => {
    const [rows] = await pool.execute(
        'SELECT * FROM student WHERE contact = ? AND contact_otp = ?',
        [contact, otp]
    );
    return rows[0];
};

// Finds a student by email
const findStudentByEmail = async (email) => {
    const [rows] = await pool.execute(
        'SELECT * FROM student WHERE email = ?',
        [email]
    );
    return rows[0];
};

// Finds a student by contact
const findStudentByContact = async (contact) => {
    const [rows] = await pool.execute(
        'SELECT * FROM student WHERE contact = ?',
        [contact]
    );
    return rows[0];
};

// NEW: Finds a student by username
const findStudentByUsername = async (username) => {
    const [rows] = await pool.execute(
        'SELECT * FROM student WHERE username = ?',
        [username]
    );
    return rows[0];
};


// Updates student's email verification status
const updateStudentEmailVerification = async (stid) => {
    const [result] = await pool.execute(
        'UPDATE student SET is_email_verified = TRUE, email_otp = NULL, email_otp_expires_at = NULL WHERE stid = ?',
        [stid]
    );
    return result;
};

// Updates student's contact verification status
const updateStudentContactVerification = async (stid) => {
    const [result] = await pool.execute(
        'UPDATE student SET is_contact_verified = TRUE, contact_otp = NULL, contact_otp_expires_at = NULL WHERE stid = ?',
        [stid]
    );
    return result;
};

// Updates student's Email OTP for resend
const updateStudentEmailOtpForResend = async (stid, newOtp, newOtpExpiresAt) => {
    const [result] = await pool.execute(
        'UPDATE student SET email_otp = ?, email_otp_expires_at = ? WHERE stid = ?',
        [newOtp, newOtpExpiresAt, stid]
    );
    return result;
};

// Updates student's Contact OTP for resend
const updateStudentContactOtpForResend = async (stid, newOtp, newOtpExpiresAt) => {
    const [result] = await pool.execute(
        'UPDATE student SET contact_otp = ?, contact_otp_expires_at = ? WHERE stid = ?',
        [newOtp, newOtpExpiresAt, stid]
    );
    return result;
};

// *******************************************************************
// UPDATED: Admin Student Management - Create Student
// This function inserts a new student record into the 'student' table,
// ensuring is_email_verified and is_contact_verified are set to FALSE.
// *******************************************************************
const createStudentByAdmin = async ({ name, email, contact, username, password }) => {
    const [result] = await pool.execute(
        'INSERT INTO student (name, email, contact, username, password, is_email_verified, is_contact_verified) VALUES (?, ?, ?, ?, ?, FALSE, FALSE)', // <-- CHANGED FROM TRUE, TRUE TO FALSE, FALSE
        [name, email, contact, username, password]
    );
    // Return the inserted ID if available, or the full result object
    return { id: result.insertId, ...result };
};

// *******************************************************************
// NEW ADDITION: Function to update student profile by ID
// *******************************************************************
const updateStudentProfileById = async (stid, updateData) => {
    let query = 'UPDATE student SET ';
    const params = [];
    const setClauses = [];

    if (updateData.name !== undefined) {
        setClauses.push('name = ?');
        params.push(updateData.name);
    }
    // Email is readonly in the form, so it shouldn't be updated here.
    // If you ever need to update email, add logic here.
    if (updateData.username !== undefined) {
        setClauses.push('username = ?');
        params.push(updateData.username);
    }
    if (updateData.contact !== undefined) {
        setClauses.push('contact = ?');
        params.push(updateData.contact);
    }
    if (updateData.password !== undefined) { // This will be the HASHED password
        setClauses.push('password = ?');
        params.push(updateData.password);
    }

    if (setClauses.length === 0) {
        console.warn('regModels: No fields provided for student profile update.');
        return { success: false, message: 'No fields to update.' };
    }

    query += setClauses.join(', ') + ' WHERE stid = ?';
    params.push(stid);

    try {
        const [result] = await pool.execute(query, params);
        console.log('regModels: updateStudentProfileById result:', result);
        return { success: result.affectedRows > 0, message: 'Profile updated successfully.' };
    } catch (error) {
        console.error('regModels: Error updating student profile by ID:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            let field = 'unknown';
            // Parse MySQL error message for more specific feedback
            if (error.message.includes('for key \'email\'') || error.message.includes('Duplicate entry') && error.message.includes('@')) field = 'Email';
            else if (error.message.includes('for key \'username\'')) field = 'Username';
            else if (error.message.includes('for key \'contact\'')) field = 'Contact';
            return { success: false, message: `${field} is already in use.` };
        }
        return { success: false, message: 'Database error during profile update.' };
    }
};


// --- Admin Operations ---

// Saves Admin with BOTH OTPs and their expiry
const saveAdminWithDualOtp = async (fullName, password, email, contact, role, emailOtp, emailOtpExpiresAt, contactOtp, contactOtpExpiresAt) => {
    const [result] = await pool.execute(
        'INSERT INTO Admin (fullName, password, role, email, contact, email_otp, email_otp_expires_at, is_email_verified, contact_otp, contact_otp_expires_at, is_contact_verified) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, ?, ?, FALSE)',
        [fullName, password, role, email, contact, emailOtp, emailOtpExpiresAt, contactOtp, contactOtpExpiresAt]
    );
    return result;
};

// Finds an Admin by email and email OTP
const findAdminByEmailAndEmailOtp = async (email, otp) => {
    const [rows] = await pool.execute(
        'SELECT * FROM Admin WHERE email = ? AND email_otp = ?',
        [email, otp]
    );
    return rows[0];
};

// Finds an Admin by contact and contact OTP
const findAdminByContactAndContactOtp = async (contact, otp) => {
    const [rows] = await pool.execute(
        'SELECT * FROM Admin WHERE contact = ? AND contact_otp = ?',
        [contact, otp]
    );
    return rows[0];
};

// Finds an Admin by email
const findAdminByEmail = async (email) => {
    const [rows] = await pool.execute(
        'SELECT * FROM Admin WHERE email = ?',
        [email]
    );
    return rows[0];
};

// Finds an Admin by contact
const findAdminByContact = async (contact) => {
    const [rows] = await pool.execute(
        'SELECT * FROM Admin WHERE contact = ?',
        [contact]
    );
    return rows[0];
};

// Updates Admin's email verification status
const updateAdminEmailVerification = async (id) => {
    const [result] = await pool.execute(
        'UPDATE Admin SET is_email_verified = TRUE, email_otp = NULL, email_otp_expires_at = NULL WHERE id = ?',
        [id]
    );
    return result;
};

// Updates Admin's contact verification status
const updateAdminContactVerification = async (id) => {
    const [result] = await pool.execute(
        'UPDATE Admin SET is_contact_verified = TRUE, contact_otp = NULL, contact_otp_expires_at = NULL WHERE id = ?',
        [id]
    );
    return result;
};

// Updates Admin's Email OTP for resend
const updateAdminEmailOtpForResend = async (id, newOtp, newOtpExpiresAt) => {
    const [result] = await pool.execute(
        'UPDATE Admin SET email_otp = ?, email_otp_expires_at = ? WHERE id = ?',
        [newOtp, newOtpExpiresAt, id]
    );
    return result;
};

// Updates Admin's Contact OTP for resend
const updateAdminContactOtpForResend = async (id, newOtp, newOtpExpiresAt) => {
    const [result] = await pool.execute(
        'UPDATE Admin SET contact_otp = ?, contact_otp_expires_at = ? WHERE id = ?',
        [newOtp, newOtpExpiresAt, id]
    );
    return result;
};


// Other existing models (keep these as they are, ensuring they use `pool.execute`)

const getSubjects = async () => {
    const [rows] = await pool.execute('SELECT * FROM subject');
    return rows;
};

const addSubject = async (subjectname) => {
    const [result] = await pool.execute('INSERT INTO subject (subjectname) VALUES (?)', [subjectname]);
    return result;
};

const addNotice = async (title, content) => {
    const [result] = await pool.execute('INSERT INTO notice (title, content) VALUES (?, ?)', [title, content]);
    return result;
};

const getNotices = async () => {
    const [rows] = await pool.execute('SELECT * FROM notice ORDER BY publish_date DESC');
    return rows;
};

const getNoticeById = async (nid) => {
    const [rows] = await pool.execute('SELECT * FROM notice WHERE nid = ?', [nid]);
    return rows[0];
};

const updateNotice = async (nid, title, content) => {
    const [result] = await pool.execute('UPDATE notice SET title = ?, content = ? WHERE nid = ?', [title, content, nid]);
    return result;
};

const deleteNotice = async (nid) => {
    const [result] = await pool.execute('DELETE FROM notice WHERE nid = ?', [nid]);
    return result;
};

const getAllStudents = async () => {
    const [rows] = await pool.execute('SELECT stid, name, email, contact, username, is_email_verified, is_contact_verified FROM student'); // Updated select fields
    return rows;
};

// NEW: Function to assign a student to a subject
const assignStudentToSubject = async (studentId, subjectId) => {
    try {
        const [result] = await pool.execute(
            'INSERT INTO student_subjects (student_id, subject_id) VALUES (?, ?)',
            [studentId, subjectId]
        );
        return result; // Returns { affectedRows: 1, insertId: ... } on success
    } catch (error) {
        // Handle unique constraint error if a student is already assigned to that subject
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Student is already assigned to this subject.');
        }
        console.error('regModels: Error assigning student to subject:', error);
        throw error; // Re-throw for controller to catch
    }
};


module.exports = {
    saveStudentWithDualOtp,
    findStudentByEmailAndEmailOtp,
    findStudentByContactAndContactOtp,
    findStudentByEmail,
    findStudentByContact,
    findStudentByUsername, // <-- Added for student addition validation
    updateStudentEmailVerification,
    updateStudentContactVerification,
    updateStudentEmailOtpForResend,
    updateStudentContactOtpForResend,
    createStudentByAdmin, // <-- NEWLY ADDED EXPORT
    updateStudentProfileById, // <-- NEWLY ADDED EXPORT FOR PROFILE UPDATE

    saveAdminWithDualOtp,
    findAdminByEmailAndEmailOtp,
    findAdminByContactAndContactOtp,
    findAdminByEmail,
    findAdminByContact,
    updateAdminEmailVerification,
    updateAdminContactVerification,
    updateAdminEmailOtpForResend,
    updateAdminContactOtpForResend,

    getSubjects,
    addSubject,
    addNotice,
    getNotices,
    getNoticeById,
    updateNotice,
    deleteNotice,
    getAllStudents,
    assignStudentToSubject, // <--- NEWLY ADDED EXPORT FOR ASSIGNMENT
};