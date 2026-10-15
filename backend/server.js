const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

const Student = require('./models/Student');
   const Course = require('./models/Course');
   const Enrollment = require('./models/Enrollment');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to search for a student by name
app.post('/api/find-student', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).send({ error: 'Student name is required' });
        }

        const student = await Student.findOne({ name });
        if (!student) {
            return res.status(404).send({ error: 'Student not found' });
        }

        res.send(student);
    } catch (error) {
        console.error('Error finding student:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Endpoint to list all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.send(students);
    } catch (error) {
        console.error('Error listing students:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Endpoint to save a student
app.post('/api/add-student', async (req, res) => {
    try {
        const { name, id, phone, zip } = req.body;
        if (!name || !id || !phone || !zip) {
            return res.status(400).send({ error: 'All fields (name, id, phone, zip) are required' });
        }

        const existing = await Student.findOne({ studentId: id });
        if (existing) {
            return res.status(409).send({ error: 'A student with this ID already exists' });
        }

        const newStudent = new Student({ name, studentId: id, phone, zip });
        await newStudent.save();

        res.status(201).send({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Endpoint to delete a student by name
app.post('/api/delete-student', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).send({ error: 'Student name is required' });
        }

        const deletedStudent = await Student.findOneAndDelete({ name });
        if (!deletedStudent) {
            return res.status(404).send({ error: 'Student not found' });
        }
                await Enrollment.deleteMany({ studentId: deletedStudent.studentId });

        res.send({ message: 'Student deleted successfully', student: deletedStudent });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});


// Endpoint to list all courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.send(courses);
    } catch (error) {
        console.error('Error listing courses:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Endpoint to add a course
app.post('/api/add-course', async (req, res) => {
    try {
        const { courseId, courseName } = req.body;
        if (!courseId || !courseName) {
            return res.status(400).send({ error: 'Course ID and name are required' });
        }

        const existing = await Course.findOne({ courseId });
        if (existing) {
            return res.status(409).send({ error: 'A course with this ID already exists' });
        }

        const newCourse = new Course({ courseId, courseName });
        await newCourse.save();

        res.status(201).send({ message: 'Course added successfully', course: newCourse });
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Endpoint to delete a course
app.post('/api/delete-course', async (req, res) => {
    try {
        const { courseId } = req.body;
        if (!courseId) {
            return res.status(400).send({ error: 'Course ID is required' });
        }

        const deletedCourse = await Course.findOneAndDelete({ courseId });
        if (!deletedCourse) {
            return res.status(404).send({ error: 'Course not found' });
        }
                await Enrollment.deleteMany({ courseId: deletedCourse.courseId });

        res.send({ message: 'Course deleted successfully', course: deletedCourse });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});


// Endpoint to enroll a student in a course
app.post('/api/enroll', async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        if (!studentId || !courseId) {
            return res.status(400).send({ error: 'Student ID and Course ID are required' });
        }

        const student = await Student.findOne({ studentId });
        if (!student) {
            return res.status(404).send({ error: 'Student not found' });
        }

        const course = await Course.findOne({ courseId });
        if (!course) {
            return res.status(404).send({ error: 'Course not found' });
        }

        const existing = await Enrollment.findOne({ studentId, courseId });
        if (existing) {
            return res.status(409).send({ error: 'Student is already enrolled in this course' });
        }

        const newEnrollment = new Enrollment({ studentId, courseId });
        await newEnrollment.save();

        res.status(201).send({ message: 'Enrollment successful', enrollment: newEnrollment });
    } catch (error) {
        console.error('Error creating enrollment:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Endpoint to list all students enrolled in a course
app.get('/api/course-roster/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const enrollments = await Enrollment.find({ courseId });
        const studentIds = enrollments.map((e) => e.studentId);
        const students = await Student.find({ studentId: { $in: studentIds } });

        res.send(students);
    } catch (error) {
        console.error('Error fetching course roster:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Unknown API routes return JSON 404
app.use('/api', (req, res) => {
    res.status(404).send({ error: 'API route not found' });
});

// Serve the built Vue app
const distPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(distPath));

// Send index.html for any other route, so refreshing /courses works
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});


// Start the server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:3000`);
});