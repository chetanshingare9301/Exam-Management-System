// D:\Exam-App\src\controllers\regCtrl.js
const regServices = require('../services/regServices');
const regModels = require('../models/regModels'); // Ensure regModels is imported
const bcrypt = require('bcryptjs');

// --- Admin Registration & Login ---
const getRegisterAdminPage = (req, res) => {
    res.render('registeradmin', { message: null, error: null });
};

const registerAdmin = async (req, res) => {
    const { fullName, password, email, contact, role } = req.body;
    const result = await regServices.registerAdmin(fullName, password, email, contact, role);

    if (result.success) {
        req.session.verificationEmail = result.email;
        req.session.verificationContact = result.contact;
        req.session.isAdminVerification = true;
        console.log("regCtrl: Admin registration successful, redirecting to /verify-otp");
        return res.redirect('/verify-otp');
    } else {
        console.error("regCtrl: Admin registration failed:", result.message);
        res.render('registeradmin', { error: result.message, message: null });
    }
};

const getAdminLoginPage = (req, res) => {
    res.render('adminlogin', { message: null, error: null });
};

const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    const result = await regServices.loginAdmin(email, password);

    if (result.success) {
        req.session.user = { id: result.user.id, fullName: result.user.fullName, email: result.user.email, role: result.user.role };
        console.log("regCtrl: Admin login successful, redirecting to /adminHome");
        res.redirect('/adminHome');
    } else if (result.requiresVerification) {
        req.session.verificationEmail = result.email;
        req.session.verificationContact = result.contact;
        req.session.isAdminVerification = true;
        console.log("regCtrl: Admin login requires verification, rendering verifyOtp page.");
        res.render('verifyOtp', { error: result.message, message: null, email: result.email, contact: result.contact, isAdmin: true });
    } else {
        console.error("regCtrl: Admin login failed:", result.message);
        res.render('adminlogin', { error: result.message, message: null });
    }
};

const getAdminHomePage = (req, res) => {
    res.render('adminHome', { user: req.session.user });
};

// Admin Subject Management
const getAddSubjectsPage = (req, res) => {
    res.render('addSubject', { message: null, error: null });
};

const addSubject = async (req, res) => {
    const { subjectname } = req.body;
    try {
        await regModels.addSubject(subjectname);
        res.render('addSubject', { message: 'Subject added successfully!', error: null });
    } catch (error) {
        console.error('Error adding subject:', error);
        res.render('addSubject', { error: 'Failed to add subject. It might already exist.', message: null });
    }
};

const getSubjectsViewPage = async (req, res) => {
    try {
        const subjects = await regModels.getSubjects();
        res.render('viewSubjects', { subjects: subjects });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.render('viewSubjects', { error: 'Failed to fetch subjects.', subjects: [] });
    }
};

// Admin Notice Management
const getAddNoticePage = (req, res) => {
    res.render('addNotice', { message: null, error: null });
};

const addNotice = async (req, res) => {
    const { title, content } = req.body;
    try {
        await regModels.addNotice(title, content);
        res.render('addNotice', { message: 'Notice added successfully!', error: null });
    } catch (error) {
        console.error('Error adding notice:', error);
        res.render('addNotice', { error: 'Failed to add notice.', message: null });
    }
};

const getViewNoticesPage = async (req, res) => {
    try {
        const notices = await regModels.getNotices();
        res.render('viewNotices', { notices: notices, navPartial: 'navforadmin.ejs' });
    } catch (error) {
        console.error('Error fetching notices:', error);
        res.render('viewNotices', { error: 'Failed to fetch notices.', notices: [], navPartial: 'navforadmin.ejs' });
    }
};

const getEditNoticePage = async (req, res) => {
    const { nid } = req.params;
    try {
        const notice = await regModels.getNoticeById(nid);
        if (notice) {
            res.render('editNotice', { notice: notice, message: null, error: null });
        } else {
            res.redirect('/admin/notices/view');
        }
    } catch (error) {
        console.error('Error fetching notice for edit:', error);
        res.redirect('/admin/notices/view');
    }
};

const postEditNotice = async (req, res) => {
    const { nid } = req.params;
    const { title, content } = req.body;
    try {
        await regModels.updateNotice(nid, title, content);
        res.redirect('/admin/notices/view');
    } catch (error) {
        console.error('Error updating notice:', error);
        res.render('editNotice', { notice: { nid, title, content }, error: 'Failed to update notice.', message: null });
    }
};

const deleteNotice = async (req, res) => {
    const { nid } = req.params;
    try {
        await regModels.deleteNotice(nid);
        res.redirect('/admin/notices/view');
    } catch (error) {
        console.error('Error deleting notice:', error);
        const notices = await regModels.getNotices();
        res.render('viewNotices', { error: 'Failed to delete notice.', notices: notices, navPartial: 'navforadmin.ejs' });
    }
};

// Admin Student Management - Get Add Student Page
const getAddStudentPage = (req, res) => {
    res.render('addstudents', { message: null, error: null, user: req.session.user });
};

// Admin Student Management - Post Add Student
const postAddStudent = async (req, res) => {
    console.log('Received payload for adding student:', req.body);

    const { name, email, contact, username, password, confirm_password } = req.body;

    if (!name || !email || !contact || !username || !password || !confirm_password) {
        console.log('Validation failed: All fields are required. Missing one or more of name, email, contact, username, password, confirm_password.');
        return res.render('addstudents', {
            error: 'All fields are required.',
            message: null,
            user: req.session.user
        });
    }

    if (password !== confirm_password) {
        console.log('Validation failed: Passwords do not match.');
        return res.render('addstudents', {
            error: 'Passwords do not match.',
            message: null,
            user: req.session.user
        });
    }

    try {
        const existingStudentEmail = await regModels.findStudentByEmail(email);
        if (existingStudentEmail) {
            console.log(`Validation failed: Student with email ${email} already exists.`);
            return res.render('addstudents', {
                error: 'Student with this email already exists.',
                message: null,
                user: req.session.user
            });
        }
        const existingStudentUsername = await regModels.findStudentByUsername(username);
        if (existingStudentUsername) {
            console.log(`Validation failed: Student with username ${username} already exists.`);
            return res.render('addstudents', {
                error: 'Student with this username already exists.',
                message: null,
                user: req.session.user
            });
        }
        const existingStudentContact = await regModels.findStudentByContact(contact);
        if (existingStudentContact) {
            console.log(`Validation failed: Student with contact ${contact} already exists.`);
            return res.render('addstudents', {
                error: 'Student with this contact number already exists.',
                message: null,
                user: req.session.user
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await regServices.addStudentByAdmin({
            name,
            email,
            contact,
            username,
            password: hashedPassword
        });

        console.log('Service result for adding student:', result);

        if (result.success) {
            res.render('addstudents', {
                message: 'Student added successfully!',
                error: null,
                user: req.session.user
            });
        } else {
            res.render('addstudents', {
                error: result.message || 'Failed to add student.',
                message: null,
                user: req.session.user
            });
        }
    } catch (error) {
        console.error('Error in postAddStudent controller:', error);
        res.render('addstudents', {
            error: 'An unexpected error occurred. Please try again.',
            message: null,
            user: req.session.user
        });
    }
};

// Admin Student Management - Get All Students Page
const getStudentsViewPage = async (req, res) => {
    try {
        const students = await regModels.getAllStudents();
        res.render('viewstudents', { students: students, navPartial: 'navforadmin.ejs', message: null, error: null });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.render('viewstudents', { error: 'Failed to fetch students.', students: [], navPartial: 'navforadmin.ejs', message: null });
    }
};


// --- Student Registration & Login ---
const getRegisterStudentPage = (req, res) => {
    res.render('registerstudent', { message: null, error: null });
};

const registerStudent = async (req, res) => {
    const { name, password, email, contact, username } = req.body;
    const result = await regServices.registerStudent(name, password, email, contact, username);

    if (result.success) {
        req.session.verificationEmail = result.email;
        req.session.verificationContact = result.contact;
        req.session.isAdminVerification = false;
        console.log("regCtrl: Student registration successful, redirecting to /verify-otp");
        return res.redirect('/verify-otp');
    } else {
        console.error("regCtrl: Student registration failed:", result.message);
        res.render('registerstudent', { error: result.message, message: null });
    }
};

const getStudentLoginPage = (req, res) => {
    res.render('studentlogin', { message: null, error: null });
};

const studentLogin = async (req, res) => {
    const { email, password } = req.body;
    const result = await regServices.loginStudent(email, password);

    if (result.success) {
        req.session.user = { id: result.user.stid, name: result.user.name, email: result.user.email, role: 'student', username: result.user.username, contact: result.user.contact };
        console.log("regCtrl: Student login successful, redirecting to /studentDashboard");
        res.redirect('/student/dashboard');
    } else if (result.requiresVerification) {
        req.session.verificationEmail = result.email;
        req.session.verificationContact = result.contact;
        req.session.isAdminVerification = false;
        console.log("regCtrl: Student login requires verification, rendering verifyOtp page.");
        res.render('verifyOtp', { error: result.message, message: null, email: result.email, contact: contact, isAdmin: false });
    } else {
        console.error("regCtrl: Student login failed:", result.message);
        res.render('studentlogin', { error: result.message, message: null });
    }
};

const getStudentHomePage = (req, res) => {
    res.render('studentsHome', { user: req.session.user });
};

// Student Dashboard Page Controller
const getStudentDashboardPage = (req, res) => {
    res.render('studentDashboard', { user: req.session.user, message: null, error: null });
};

// Student Profile Management
const getStudentProfile = async (req, res) => {
    try {
        const student = await regModels.findStudentByEmail(req.session.user.email);
        if (student) {
            res.render('studentprofile', { student: student, message: null, error: null });
        } else {
            console.error('regCtrl: Student not found for profile display:', req.session.user.id);
            res.render('studentprofile', { student: null, error: 'Student profile not found.', message: null });
        }
    } catch (error) {
        console.error('regCtrl: Error fetching student profile:', error);
        res.render('studentprofile', { student: null, error: 'Failed to load profile.', message: null });
    }
};

const getEditStudentProfile = async (req, res) => {
    try {
        const student = await regModels.findStudentByEmail(req.session.user.email);
        if (student) {
            res.render('editStudentProfile', { student: student, message: null, error: null });
        } else {
            console.error('regCtrl: Student not found for profile edit:', req.session.user.id);
            res.render('editStudentProfile', { student: null, error: 'Student profile not found for editing.', message: null });
        }
    } catch (error) {
        console.error('regCtrl: Error fetching student profile for edit:', error);
        res.render('editStudentProfile', { student: null, error: 'Failed to load profile for editing.', message: null });
    }
};

const postEditStudentProfile = async (req, res) => {
    console.log('regCtrl: Received payload for student profile update:', req.body);

    const { name, username, contact, newPassword, confirmNewPassword } = req.body;
    const stid = req.session.user.id;
    let hashedPassword = null;
    const currentStudentEmail = req.session.user.email;

    const updateData = {};

    if (name !== undefined && name.trim() !== '') {
        updateData.name = name.trim();
    }
    if (username !== undefined && username.trim() !== '') {
        if (username.trim() !== req.session.user.username) {
            const existingStudent = await regModels.findStudentByUsername(username.trim());
            if (existingStudent && existingStudent.stid !== stid) {
                console.log(`regCtrl: Duplicate username detected: ${username.trim()}`);
                const studentDataForRender = await regModels.findStudentByEmail(currentStudentEmail);
                return res.render('editStudentProfile', {
                    student: studentDataForRender,
                    error: 'This username is already in use.',
                    message: null
                });
            }
        }
        updateData.username = username.trim();
    }
    if (contact !== undefined && contact.trim() !== '') {
        if (contact.trim() !== req.session.user.contact) {
            const existingStudent = await regModels.findStudentByContact(contact.trim());
            if (existingStudent && existingStudent.stid !== stid) {
                console.log(`regCtrl: Duplicate contact detected: ${contact.trim()}`);
                const studentDataForRender = await regModels.findStudentByEmail(currentStudentEmail);
                return res.render('editStudentProfile', {
                    student: studentDataForRender,
                    error: 'This contact number is already in use.',
                    message: null
                });
            }
        }
        updateData.contact = contact.trim();
    }

    if (newPassword) {
        if (newPassword.length < 6) {
            console.log('regCtrl: Password too short');
            const studentDataForRender = await regModels.findStudentByEmail(currentStudentEmail);
            return res.render('editStudentProfile', {
                student: studentDataForRender,
                error: 'New password must be at least 6 characters long.',
                message: null
            });
        }
        if (newPassword !== confirmNewPassword) {
            console.log('regCtrl: Passwords do not match');
            const studentDataForRender = await regModels.findStudentByEmail(currentStudentEmail);
            return res.render('editStudentProfile', {
                student: studentDataForRender,
                error: 'New password and confirmation do not match.',
                message: null
            });
        }
        hashedPassword = await bcrypt.hash(newPassword, 10);
        updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
        console.log('regCtrl: No valid fields provided for update.');
        const studentDataForRender = await regModels.findStudentByEmail(currentStudentEmail);
        return res.render('editStudentProfile', {
            student: studentDataForRender,
            error: 'No changes submitted or invalid input.',
            message: null
        });
    }

    try {
        const result = await regServices.updateStudentProfile(stid, updateData);
        console.log('regCtrl: Result from updateStudentProfile service:', result);

        const studentDataForRender = await regModels.findStudentByEmail(currentStudentEmail);

        if (result.success) {
            // Update session data if name, username, or contact changed
            if (updateData.name) req.session.user.name = updateData.name;
            if (updateData.username) req.session.user.username = updateData.username;
            if (updateData.contact) req.session.user.contact = updateData.contact;

            res.render('editStudentProfile', {
                student: studentDataForRender,
                message: result.message,
                error: null
            });
        } else {
            res.render('editStudentProfile', {
                student: studentDataForRender,
                error: result.message,
                message: null
            });
        }
    } catch (error) {
        console.error('regCtrl: Error updating student profile:', error);
        const studentDataForRender = await regModels.findStudentByEmail(currentStudentEmail);
        res.render('editStudentProfile', {
            student: studentDataForRender,
            error: 'An unexpected error occurred during profile update.',
            message: null
        });
    }
};


// Student Exam & Notice Views
const getStudentExamsPage = (req, res) => {
    res.render('myExams', { user: req.session.user });
};

const getEnrollExamsPage = (req, res) => {
    res.render('enrollExams', { user: req.session.user });
};

const getStudentNoticesPage = async (req, res) => {
    try {
        const notices = await regModels.getNotices();
        res.render('notices', { notices: notices, navPartial: 'studentnav.ejs' });
    } catch (error) {
        console.error('Error fetching student notices:', error);
        res.render('notices', { error: 'Failed to fetch notices.', notices: [], navPartial: 'studentnav.ejs' });
    }
};

// OTP Verification
const getOtpVerificationPage = (req, res) => {
    const email = req.session.verificationEmail;
    const contact = req.session.verificationContact;
    const isAdmin = req.session.isAdminVerification || false;

    console.log(`regCtrl: Rendering OTP verification page. Email: ${email}, Contact: ${contact}, IsAdmin: ${isAdmin}`);

    if (!email && !contact) {
        console.warn("regCtrl: No email or contact in session for OTP verification. Redirecting.");
        return res.redirect(isAdmin ? '/adminlogin' : '/studentlogin');
    }

    res.render('verifyOtp', { message: null, error: null, email: email, contact: contact, isAdmin: isAdmin });
};

const verifyOtp = async (req, res) => {
    const { emailOtp, contactOtp } = req.body;
    const email = req.session.verificationEmail;
    const contact = req.session.verificationContact;
    const isAdmin = req.session.isAdminVerification || false;

    console.log(`regCtrl: verifyOtp POST received. Email OTP: ${emailOtp}, Contact OTP: ${contactOtp}, IsAdmin: ${isAdmin}`);
    console.log(`regCtrl: Session identifiers - Email: ${email}, Contact: ${contact}`);

    if (!email && !contact) {
        console.warn("regCtrl: No email or contact in session during POST /verify-otp. Redirecting.");
        return res.redirect(isAdmin ? '/adminlogin' : '/studentlogin');
    }

    let overallSuccess = true;
    let errorMessage = [];
    let user;

    try {
        if (isAdmin) {
            user = await regModels.findAdminByEmail(email);
            console.log(`regCtrl: Found admin user for verification: ${user ? user.email : 'None'}`);
        } else {
            user = await regModels.findStudentByEmail(email);
            console.log(`regCtrl: Found student user for verification: ${user ? user.email : 'None'}`);
        }

        if (!user) {
            console.error("regCtrl: User not found in database for verification.");
            return res.render('verifyOtp', { error: "User not found for verification.", email: email, contact: contact, isAdmin: isAdmin });
        }

        if (!user.is_email_verified && emailOtp) {
            let emailResult;
            if (isAdmin) {
                console.log(`regCtrl: Attempting to verify admin email OTP. Identifier: ${email}, OTP: ${emailOtp}`);
                emailResult = await regServices.verifyAdminOtp(email, emailOtp, 'email');
            } else {
                console.log(`regCtrl: Attempting to verify student email OTP. Identifier: ${email}, OTP: ${emailOtp}`);
                emailResult = await regServices.verifyStudentOtp(email, emailOtp, 'email');
            }

            if (!emailResult.success) {
                overallSuccess = false;
                errorMessage.push(`Email OTP: ${emailResult.message}`);
                console.warn(`regCtrl: Email OTP verification failed: ${emailResult.message}`);
            } else {
                user.is_email_verified = true;
                console.log(`regCtrl: Email OTP for ${email} verified successfully.`);
            }
        } else if (!user.is_email_verified && !emailOtp) {
            errorMessage.push("Email OTP is required.");
            overallSuccess = false;
            console.warn("regCtrl: Email verification required but no OTP provided.");
        }

        if (!user.is_contact_verified && contactOtp) {
            let contactResult;
            if (isAdmin) {
                console.log(`regCtrl: Attempting to verify admin contact OTP. Identifier: ${contact}, OTP: ${contactOtp}`);
                contactResult = await regServices.verifyAdminOtp(contact, contactOtp, 'contact');
            } else {
                console.log(`regCtrl: Attempting to verify student contact OTP. Identifier: ${contact}, OTP: ${contactOtp}`);
                contactResult = await regServices.verifyStudentOtp(contact, contactOtp, 'contact');
            }

            if (!contactResult.success) {
                overallSuccess = false;
                errorMessage.push(`Contact OTP: ${contactResult.message}`);
                console.warn(`regCtrl: Contact OTP verification failed: ${contactResult.message}`);
            } else {
                user.is_contact_verified = true;
                console.log(`regCtrl: Contact OTP for ${contact} verified successfully.`);
            }
        } else if (!user.is_contact_verified && !contactOtp) {
            errorMessage.push("Contact OTP is required.");
            overallSuccess = false;
            console.warn("regCtrl: Contact verification required but no OTP provided.");
        }

        console.log(`regCtrl: Current verification status - Email: ${user.is_email_verified}, Contact: ${user.is_contact_verified}`);

        if (user.is_email_verified && user.is_contact_verified) {
            console.log("regCtrl: Both email and contact verified. Clearing session and redirecting to login page.");
            delete req.session.verificationEmail;
            delete req.session.verificationContact;
            delete req.session.isAdminVerification;
            res.render(isAdmin ? 'adminlogin' : 'studentlogin', { message: "Account fully verified! You can now log in.", error: null });
        } else {
            console.log("regCtrl: Not fully verified. Re-rendering verifyOtp page with errors:", errorMessage.join(" "));
            res.render('verifyOtp', {
                error: errorMessage.join(" "),
                message: null,
                email: email,
                contact: contact,
                isAdmin: isAdmin
            });
        }

    } catch (error) {
        console.error('regCtrl: Error during verifyOtp process:', error);
        res.render('verifyOtp', { error: 'An error occurred during verification.', message: null, email: email, contact: contact, isAdmin: isAdmin });
    }
};

const resendOtp = async (req, res) => {
    const { identifier, type } = req.body;
    const isAdmin = req.session.isAdminVerification || false;

    console.log(`regCtrl: Resend OTP requested for identifier: ${identifier}, type: ${type}, isAdmin: ${isAdmin}`);

    if (!identifier || !type) {
        console.warn("regCtrl: Missing identifier or type for resend request.");
        return res.json({ success: false, error: "Missing identifier or type for resend." });
    }

    let result;
    try {
        if (isAdmin) {
            console.log("regCtrl: Calling regServices.resendAdminOtp...");
            result = await regServices.resendAdminOtp(identifier, type);
        } else {
            console.log("regCtrl: Calling regServices.resendStudentOtp...");
            result = await regServices.resendStudentOtp(identifier, type);
        }
        console.log("regCtrl: Resend OTP service result:", result);
        res.json(result);
    } catch (error) {
        console.error("regCtrl: Error during resendOtp:", error);
        res.json({ success: false, error: "An error occurred while resending OTP." });
    }
};


// Controller function for Admin Profile/Password Reset
const getResetPasswordPage = (req, res) => {
    res.render('adminResetPassword', {
        user: req.session.user,
        message: req.flash('message'),
        error: req.flash('error')
    });
};


// Controller function for Assign Students page (Updated to fetch data)
const getAssignStudentsPage = async (req, res) => {
    try {
        const subjects = await regModels.getSubjects(); // Fetch all subjects
        const students = await regModels.getAllStudents(); // Fetch all students
        res.render('assignStudents', {
            message: null,
            error: null,
            subjects: subjects, // Pass data to the EJS template
            students: students
        });
    } catch (error) {
        console.error('Error rendering assign students page:', error);
        res.render('assignStudents', {
            error: 'Failed to load assignment page.',
            message: null,
            subjects: [],
            students: []
        });
    }
};

// Handle POST request for assigning students to subjects
const postAssignStudents = async (req, res) => {
    console.log('--- POST /admin/assign-students hit! ---'); // <--- ADDED THIS LINE
    console.log('Request body:', req.body);                 // <--- ADDED THIS LINE

    const { studentId, subjectId } = req.body; // Get data from the form

    try {
        if (!studentId || !subjectId) {
            console.log('Validation failed: Missing studentId or subjectId in req.body'); // <--- ADDED THIS LINE
            // Re-fetch data for the page if validation fails
            const subjects = await regModels.getSubjects();
            const students = await regModels.getAllStudents();
            return res.render('assignStudents', {
                error: 'Please select both a student and a subject.',
                message: null,
                subjects: subjects,
                students: students
            });
        }

        // If we reach here, studentId and subjectId are present
        console.log(`Attempting to assign Student ID: ${studentId} to Subject ID: ${subjectId}`); // <--- ADDED THIS LINE

        await regModels.assignStudentToSubject(studentId, subjectId);

        // On success, re-fetch data and render with a success message
        const subjects = await regModels.getSubjects();
        const students = await regModels.getAllStudents();
        res.render('assignStudents', {
            message: 'Student assigned to subject successfully!',
            error: null,
            subjects: subjects,
            students: students
        });

    } catch (error) {
        console.error('Error in postAssignStudents controller:', error); // <--- MODIFIED THIS LINE slightly

        // Re-fetch data for the page in case of error
        const subjects = await regModels.getSubjects();
        const students = await regModels.getAllStudents();

        let errorMessage = 'Failed to assign student to subject. Please try again.';
        if (error.message === 'Student is already assigned to this subject.') {
            errorMessage = error.message; // Use the specific error from the model
        }

        res.render('assignStudents', {
            error: errorMessage,
            message: null,
            subjects: subjects,
            students: students
        });
    }
};


module.exports = {
    // Admin
    getRegisterAdminPage,
    registerAdmin,
    getAdminLoginPage,
    adminLogin,
    getAdminHomePage,
    getAddSubjectsPage,
    addSubject,
    getSubjectsViewPage,
    getAddNoticePage,
    addNotice,
    getViewNoticesPage,
    getEditNoticePage,
    postEditNotice,
    deleteNotice,
    getAddStudentPage,
    postAddStudent,
    getStudentsViewPage,
    getResetPasswordPage,

    // Student
    getRegisterStudentPage,
    registerStudent,
    getStudentLoginPage,
    studentLogin,
    getStudentHomePage,
    getStudentDashboardPage,
    getStudentProfile,
    getEditStudentProfile,
    postEditStudentProfile,
    getStudentExamsPage,
    getEnrollExamsPage,
    getStudentNoticesPage,
    getAssignStudentsPage,
    postAssignStudents,

    // OTP
    getOtpVerificationPage,
    verifyOtp,
    resendOtp,
};