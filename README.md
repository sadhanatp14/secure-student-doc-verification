# Crypt-o-Course

**Cryptographically Secured Course Management Platform**

A full-stack web application implementing enterprise-grade security features including multi-factor authentication, role-based access control, AES-256 encryption, RSA-2048 digital signatures, and comprehensive cryptographic protocols for secure course management and student enrollment.

---

## Project Overview

Crypt-o-Course is a secure academic platform designed for educational institutions to manage courses, enrollments, and user access with military-grade cryptography. The system implements NIST-compliant authentication, multi-layer encryption, and granular access control to protect sensitive academic data.

### **Key Highlights**
- **Multi-Factor Authentication** - Password + Email OTP (6-digit, 5-minute expiry)
- **Role-Based Access Control** - 3 roles (Student, Faculty, Admin)
- **AES-256-CBC Encryption** - Course data encrypted with random IV
- **RSA-2048 Digital Signatures** - Data integrity and authenticity verification
- **bcrypt Password Hashing** - 10 rounds with automatic salt generation
- **Email Integration** - Real Gmail SMTP for OTP delivery
- **Brute-Force Protection** - 5-minute account lockout after 3 failed attempts
- **Base64 Encoding** - Safe data transmission for encrypted content

---

## Tech Stack

### **Frontend**
- **Framework:** Next.js 16.0.10 (React 18 with TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Routing:** Next.js App Router
- **HTTP Client:** Fetch API with custom API wrapper

### **Backend**
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JSON Web Tokens (jsonwebtoken)
- **Password Hashing:** bcrypt (bcryptjs)
- **Encryption:** Node.js crypto module (AES-256, RSA-2048, SHA-256)
- **Email:** Nodemailer (Gmail SMTP)

## Quick Start

### **Prerequisites**
- Node.js 18+ and npm
- MongoDB instance (local or cloud) with connection string
- Gmail account with App Password (for OTP emails)

### **1. Backend Setup**

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with the following:

```env
# MongoDB Connection
MONGO_URI=your-mongodb-connection-string
# Example: mongodb://localhost:27017/secure-course-db
# Or for cloud: mongodb+srv://user:password@host/dbname

# Server
PORT=5001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Encryption
AES_SECRET=your-32-character-aes-secret-key-here

# Invitations
INVITE_SECRET=your-invite-token-secret-key

# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password-16-chars
```

**Start the backend:**
```bash
npm start
```

Backend will run on `http://localhost:5001`

### **2. Frontend Setup**

```bash
cd frontend/secure-course-ui
npm install
```

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

**Start the frontend:**
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## Features

### **Authentication & Security**
- Multi-factor authentication with 6-digit OTP
- JWT token-based session management (24-hour expiry)
- Login attempt limiting (5-minute lockout after 3 failures)
- OTP expiry and attempt limiting
- Automatic OTP expiration with MongoDB TTL

### **Authorization (RBAC)**
- Three user roles: Student, Faculty, Admin
- Role-based access control on protected resources
- Granular permissions for courses, enrollments, and user management

### **Encryption & Data Security**
- AES-256-CBC symmetric encryption for sensitive course data
- RSA-2048 digital signatures for data authenticity
- SHA-256 cryptographic hashing
- bcrypt password hashing with salting

### **Course & Enrollment Management**
- Course creation with encrypted data storage
- Digital signatures on all courses
- Student enrollment workflow with faculty approval
- Status tracking (Pending, Approved, Rejected)

### **Admin Functions**
- User management and deletion
- Email-based invitation system for new users
- System dashboard with user and course statistics

---

## Environment Variables Guide

### **Backend (.env)**

| Variable | Example | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://localhost:27017/secure-course-db` | MongoDB connection string |
| `PORT` | `5001` | Server port |
| `JWT_SECRET` | `your-secret-key` | Secret for signing JWT tokens |
| `AES_SECRET` | `32-char-key-here` | AES encryption key (must be 32 chars) |
| `INVITE_SECRET` | `invite-secret` | Secret for invitation tokens |
| `EMAIL_USER` | `user@gmail.com` | Gmail address for sending OTPs |
| `EMAIL_PASSWORD` | `xxxx xxxx xxxx xxxx` | Gmail app-specific password |

### **Frontend (.env.local)**

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5001/api` | Backend API base URL |

---

## Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend/secure-course-ui
npm run dev
```

Visit `http://localhost:3000` in your browser to access the application.

### **Test Credentials**

The system comes with a sample admin account:
- **Email:** `admin@example.com`
- **Password:** `admin123`

You can register new users through the registration page.

---

## Project Structure

```
secure-student-doc-verification/
├── backend/
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Auth & role verification
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API endpoints
│   ├── utils/               # Crypto utilities
│   ├── src/
│   │   └── server.js        # Express app entry point
│   └── package.json
│
└── frontend/
    └── secure-course-ui/
        ├── app/             # Next.js pages & layouts
        ├── components/      # React components
        ├── lib/            # API client & utilities
        └── package.json
```

---

## Academic Compliance

This project satisfies all requirements for the lab evaluation:

✓ **Authentication** - Single-factor (password) + Multi-factor (OTP)  
✓ **Authorization** - RBAC with ACL (3 subjects, 14+ objects)  
✓ **Encryption** - AES-256-CBC with key exchange  
✓ **Hashing** - bcrypt with salt (10 rounds)  
✓ **Digital Signatures** - RSA-2048 with SHA-256  
✓ **Encoding** - Base64 implementation  

---

## Development Notes

- **Hot Reload:** Both frontend and backend support hot reloading during development
- **CORS:** Backend configured to accept requests from `http://localhost:3000`
- **Database:** MongoDB collections are created automatically on first write
- **Emails:** OTP emails are sent in real-time to the provided email address
