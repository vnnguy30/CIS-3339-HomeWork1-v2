# CIS 3339 Homework 1: Student Management System

A full-stack student, course, and enrollment manager built with Vue 3 (Composition API), Vue Router, Pinia, Express, and MongoDB.

## Required Software

- Node.js 22 or newer and npm
- MongoDB Community Edition, running locally
- A modern web browser

## Environment Variables

The backend reads its configuration from `backend/.env`, which is committed to this repository:

```
MONGODB_URI=mongodb://127.0.0.1:27017/cis3339_homework1
```

No passwords or cloud credentials are needed. The database and collections are created automatically on first use, so no setup, seed, or migration step is required.

## Start MongoDB

MongoDB Community Edition must be running before you start the app.

- **Windows:** MongoDB normally runs as a service. Check it with `Get-Service -Name MongoDB` in PowerShell, and start it with `net start MongoDB` if needed.
- **macOS (Homebrew):** `brew services start mongodb-community`
- **Linux (systemd):** `sudo systemctl start mongod`

## Install, Build, and Run

Run these commands from the project root:

```bash
npm install
npm run build
npm start
```

- `npm install` installs the dependencies for both `backend/` and `client/`.
- `npm run build` compiles the Vue app into `client/dist`.
- `npm start` starts the Express server, which serves both the API and the built Vue app.

Then open **http://localhost:3000/** in your browser.

## Development Mode (optional)

Run the backend and the Vue dev server in two terminals:

```bash
cd backend
node server.js
```

```bash
cd client
npm run dev
```

Then open http://localhost:5173/. The dev server proxies `/api` requests to the backend on port 3000.

## Features

- **Students:** add, search, display, and delete. Duplicate student IDs are rejected.
- **Courses:** add, list, and delete. Duplicate course IDs are rejected.
- **Enrollments:** enroll an existing student in an existing course, reject duplicates, and view a course roster.
- **Data integrity:** deleting a student or a course also deletes its enrollments.

## API Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/students` | List all students |
| POST | `/api/add-student` | Add a student |
| POST | `/api/find-student` | Find a student by name |
| POST | `/api/delete-student` | Delete a student and their enrollments |
| GET | `/api/courses` | List all courses |
| POST | `/api/add-course` | Add a course |
| POST | `/api/delete-course` | Delete a course and its enrollments |
| POST | `/api/enroll` | Enroll a student in a course |
| GET | `/api/course-roster/:courseId` | List students enrolled in a course |

## Project Structure

```
backend/   Express API and Mongoose models
client/    Vue 3 app (Vue Router, Pinia)
```