# TechVerse Secure 🔐

A full-stack authentication application built with Node.js, Express.js, HTML, CSS and JavaScript.

## Features

- User registration
- User login
- Password hashing with bcryptjs
- JWT authentication
- Protected dashboard API
- Password show/hide icon
- Login error handling
- Responsive interface
- Logout functionality

## Technologies

| Technology | Purpose |
|---|---|
| HTML5 | Structure |
| CSS3 | Design |
| JavaScript | Frontend logic |
| Node.js | Backend runtime |
| Express.js | API development |
| bcryptjs | Password hashing |
| JWT | Authentication |
| dotenv | Environment variables |

## Project Structure

- public/index.html
- server.js
- package.json
- package-lock.json
- .gitignore

## Installation

Clone the repository:

    git clone https://github.com/vasu-h10/TechVerse-Secure.git

    cd TechVerse-Secure

Install dependencies:

    npm install

Create a private .env file containing:

    JWT_SECRET=your_long_random_secret

Start the application:

    node server.js

Open http://localhost:3000

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/status | API status |
| POST | /api/register | Register |
| POST | /api/login | Login |
| GET | /api/profile | Protected profile |

## Current Status

- Frontend and backend integration: Complete
- Registration and login: Complete
- Password hashing: Complete
- JWT authentication: Complete
- Protected API: Complete
- Permanent database: Planned
- Cloud deployment: Planned

## Important Notice

This is a learning prototype, not production-ready authentication software. User accounts are currently stored in memory and disappear when the server restarts.

## Developer

Vasu

GitHub: https://github.com/vasu-h10

## License

No open-source license has been added yet.
