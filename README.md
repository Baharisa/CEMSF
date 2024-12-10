# Campus Event Management System (CEMS) 

 Project Overview
The Campus Event Management System (CEMS) is a comprehensive web application that allows students, event managers, and administrators to create, manage, view, and register for campus events. Users can view upcoming events, register for events, and event managers can add, update, or delete events.

The system has a simple, user-friendly interface and secure authentication to ensure only authorized users have access to event management features.

Project Structure

CEMSF/
├── config/          // Database connection (db.js)
├── images/          // Images for events and site assets
├── public/          // Static HTML, CSS, and JavaScript files
├── routes/          // Backend routes (auth, events, dashboard)
├── middleware/      // Authentication middleware (authMiddleware.js)
├── server.js        // Main server file
├── .env             // Environment variables (DB credentials, JWT secret)
└── README.md        // Project documentation

Tech Stack
Frontend:

HTML - Structure of the web pages
CSS - Styling for the web pages
JavaScript - Interactivity and dynamic elements
Moment.js - Date and time formatting
Backend:

Node.js - Server-side runtime environment
Express.js - Web framework for building RESTful APIs
JWT - User authentication using tokens
Bcrypt - Password hashing for secure storage
Database:

PostgreSQL - Relational database to store user, event, and registration data

Features
User Roles: Roles include Admin, Event Manager, and Regular User (Student)
User Authentication: Users can register, log in, and access a personalized dashboard
Event Management: View, create, update, and delete events
Event Registration: Students can register for events
Dashboard View: Admins and event managers can see total events, total users, and total registrations
Access Control: Only admins and event managers can add, edit, and delete events
Pagination: Events are paginated to avoid long page loads

 Installation & Setup
Follow these steps to set up the project on your local machine.

 Prerequisites
Node.js (v16 or later) - Download from https://nodejs.org/
PostgreSQL - Install PostgreSQL on your system and create a database

Clone the Repository

git clone https://github.com/your-username/cemsf.git
cd cemsf

Install Dependencies
Run the following command to install the required packages:

bash
Copy code
npm install

 Database Setup
Run the following commands to create tables in PostgreSQL:


-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events Table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL
);

-- Registrations Table
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  event_id INTEGER REFERENCES events(id)
);

Run the Server
Start the server using the following command:

node server.js
You should see:

Server running on port 5000

API Endpoints
Method	Endpoint	Description	Access
POST	/api/auth/register	Register a new user	Public
POST	/api/auth/login	Log in to the system	Public
GET	/api/events	View paginated events	All Users
POST	/api/events	Create a new event	Admin/Event Manager
PUT	/api/events/:id	Update an event by ID	Admin/Event Manager
DELETE	/api/events/:id	Delete an event by ID	Admin/Event Manager
POST	/api/events/register	Register for an event	Students
GET	/api/dashboard/statistics	View dashboard statistics	Admin/Event Manager
GET	/api/auth/profile	View current user profile	All Users

 How to Use
Register/Login

Go to /register.html to create an account
After logging in, users can view events and their roles
View Events

Students can view events but cannot create, edit, or delete them
Event Managers and Admins can add, edit, and delete events
Create an Event

Admins and Event Managers can create events from the Dashboard page
Register for Events

Students can register for events by clicking Register

 User Roles
Admin: Full control over the system, including user roles, events, and statistics
Event Manager: Can create, update, and delete events
User/Student: Can only register and view events


Common Issues & Solutions
Issue	Solution
"Cannot connect to database"	Make sure PostgreSQL is running and check .env file for credentials.
"JWT Token expired"	Log in again to receive a new token.
"Internal server error (500)"	Check server logs to see detailed error.


Command	Description
cd path/to/CEMSF	Go to project directory
node server.js	Start the server
psql -U postgres	Log into PostgreSQL
\c cems	Connect to the database
\dt	View all tables
\d users	View table structure
