# Bbrains 🧠

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Node](https://img.shields.io/badge/node-v18%2B-green)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)

A comprehensive, gamified Learning Management System (LMS) with integrated marketplace functionality and a digital wallet system. Bbrains transforms student engagement with our smart learning platform, blending modern educational needs with a rewarding user experience.

---

## 🌟 Key Features

### 🎓 Academic Management
- **Course Enrollment & Management:** Create robust courses with subjects and progressive chapters.
- **Assignment Handling:** Assign tasks, accept multi-format submissions, and track statuses.
- **Automated Grading System:** Provide structured feedback, remarks, and xp rewards.
- **Announcements & Notifications:** Real-time push notifications using Supabase and socket integrations for global or college-specific announcements.
- **Student Performance Tracking:** Analytics dashboard summarizing attendance, grades, and xp progress.

### 🎮 Gamification System
- **XP and Leveling System:** Students earn experience points (XP) for completing assignments, which translates into leveling up.
- **Achievement Badges:** Unlock visual badges (e.g., Code, Math, Science) for reaching milestones.
- **Leaderboards:** Competitive weekly, monthly, and all-time leaderboards querying optimized database views.
- **Streak Tracking:** Encourage daily logins through a reward-based streak mechanism.

### 🛒 Marketplace & Digital Wallet
- **Product Catalog:** A fully featured digital library for purchasing academic resources.
- **Shopping Cart & Checkout:** Secure and transactional checkout flow utilizing Prisma for data consistency.
- **Razorpay Integration:** Complete fee and marketplace payment processing securely.
- **Digital Wallet System:** In-app virtual currency for peer-to-peer transfers, protected by a secure PIN system.
- **Transaction History:** Comprehensive ledger and audit logging for all credit and debit movements.

### 🏢 Administration & Security
- **Multi-Role RBAC:** Distinct permission levels for Students, Teachers, Staff, Managers, Admins, and Superadmins.
- **Comprehensive Audit Logging:** Track every significant action in the system for administrative review.
- **College/Institution Management:** Multi-tenant architecture allowing different colleges to operate independently on the same platform.

---

## 🛠️ Technology Stack

### Frontend Client
- **Framework:** Next.js (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS & Radix UI primitives
- **State Management:** React Hooks & Context API
- **Data Fetching:** Axios

### Backend Server
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 5.2
- **Database:** PostgreSQL (v14+)
- **ORM:** Prisma 7.6.0 (with advanced features like `createMany` and Views)
- **Validation:** Zod
- **Authentication:** Dual strategy using custom JWTs (HTTP-only cookies) and Supabase Auth integration
- **Real-time:** Supabase Realtime Channels & Socket.io

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18.0.0 or higher
- PostgreSQL 14.0 or higher
- npm or yarn
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/harshhhh1/Bbrains.git
   cd Bbrains
   ```

2. **Setup the Backend Server**
   ```bash
   cd server
   npm install
   ```
   *Create a `.env` file in the `server` directory. Reference the [Developer Guide](Developer_Guide.md) for a complete list of required environment variables including `DATABASE_URL` and `JWT_SECRET`.*

3. **Database Initialization**
   Apply migrations and seed initial dummy data (admin accounts, colleges, etc.):
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed
   ```

4. **Run the Backend Development Server**
   ```bash
   npm run dev &
   ```
   The backend API will run on `http://localhost:3000` (or your configured `PORT`).

5. **Setup the Frontend Client**
   Open a new terminal window:
   ```bash
   cd client
   npm install
   ```
   *Configure the `.env.local` file with `NEXT_PUBLIC_API_URL` pointing to your backend.*

6. **Run the Frontend Development Server**
   ```bash
   npm run dev &
   ```
   Access the web app at `http://localhost:3001` (or whichever port Next.js assigns).

---

## 📚 Documentation Resources

We maintain comprehensive documentation for our developers and API consumers:
- [**API Documentation**](API_Documentation.md): Detailed schemas, authentication flows, and endpoint references.
- [**Developer Guide**](Developer_Guide.md): Architecture overview, contribution guidelines, and local environment setup.

---

## 🤝 Contributing

We welcome contributions to Bbrains! Please read our contribution guidelines in the [Developer Guide](Developer_Guide.md) before submitting a Pull Request. Make sure to follow conventional commits and branch naming standards.

---

**Built with ❤️ for modern education**
