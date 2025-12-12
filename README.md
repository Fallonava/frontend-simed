# Fallonava (Sistem Informasi Manajemen Rumah Sakit)

Fallonava is a comprehensive Hospital Management System designed to streamline healthcare operations. It features a modern, responsive frontend and a robust backend API for managing patients, doctors, queues, and administrative tasks.

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-Private-blue.svg)

## 🚀 Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Real-time**: [Socket.io-client](https://socket.io/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: JWT & Bcrypt
- **Process Manager**: [PM2](https://pm2.keymetrics.io/)

## ✨ Key Features
- **Dashboard**: Real-time insights for Doctors, Staff, and Admins.
- **Patient Management**: Registration, search, and medical records.
- **Queue System**: Automated numbering and display system.
- **Doctor Schedule**: Manage shifts and availability.
- **Role-Based Access**: Secure login for Admin, Doctor, and Staff.

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or Remote)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/Start-Z/frontend-simed.git
cd frontend-simed
```

### 2. Backend Setup
```bash
cd backend
npm install

# Setup Environment Variables (See .env.example)
# Create .env file with DATABASE_URL, JWT_SECRET, etc.

# Database Migration
npx prisma generate
npx prisma db push

# Start Server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Setup Environment Variables
# Create .env file with VITE_API_URL

# Start Development Server
npm run dev
```

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/simed?schema=public"
JWT_SECRET="your_jwt_secret"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL="http://localhost:3000/api"
VITE_SOCKET_URL="http://localhost:3000"
```

## 🚀 Deployment

The project uses **GitHub Actions** for automated CI/CD to AWS EC2.

- **Production Branch**: `dev`
- **Workflow File**: `.github/workflows/deploy.yml`
- **Server Script**: `scripts/deploy_prod.sh`

### Manual Deployment (Server-Side)
If automation fails, you can trigger the deployment script manually on the server:
```bash
ssh ubuntu@app.fallonava.my.id
bash ~/simed/scripts/deploy_prod.sh
```

## 🤝 Contributing
1. Create a feature branch (`git checkout -b feature/AmazingFeature`).
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
3. Push to the branch (`git push origin feature/AmazingFeature`).
4. Open a Pull Request.

---
© 2025 Fallonava Development Team. All Rights Reserved.
