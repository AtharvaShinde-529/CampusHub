Here is the complete, highly detailed `README.md` file. I have formatted it perfectly with Markdown so it looks incredibly professional on GitHub. 

You can just open your `README.md` file in VS Code or Notepad, delete everything, and paste this entire block in.

---

```markdown
# 🎓 CampusHub

**A Unified Campus Engagement, Opportunities and Student Participation Platform.**

CampusHub is a full-stack, role-aware web application designed to eliminate the fragmentation of campus activities, clubs, events, and external opportunities. It provides a centralized, secure digital environment for students, faculty, and administrators to connect, discover, and participate in campus life seamlessly.

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [Local Setup & Installation](#-local-setup--installation)
6. [Test Credentials](#-test-credentials)
7. [Project Structure](#-project-structure)
8. [Academic Context](#-academic-context)

---

## 🚀 Project Overview

In a large college ecosystem, information regarding co-curricular activities and opportunities is scattered across WhatsApp groups, emails, physical notice boards, and social media. This creates a massive gap between available opportunities and actual student participation.

**CampusHub** solves this by introducing a "Unified Engagement Layer" that sits alongside the traditional academic portal. The platform enforces strict server-side authorization, utilizes a relational database to maintain data consistency, and provides a centralized discovery feed for everything happening on campus.

---

## ✨ Key Features

### 🎭 Role-Based Access Control (RBAC)
The platform distinguishes between **Global Roles** (Student, Faculty, Admin) and **Organization-Scoped Roles** (Club Head, Committee Member, Member).
- Secure JWT-based authentication with Argon2 password hashing.
- Dual-layer authorization enforced at the API level.
- Admins can suspend or reactivate any account, instantly blocking access.

### 🏢 Unified Club Management
- **Discovery:** Search and join technical, cultural, and sports clubs.
- **Admin Approvals:** New clubs are created in a `PENDING_REVIEW` state and require Admin approval.
- **Organization Lifecycle:** Admins can manage annual club renewals and monitor expiry dates.
- **Club Announcements:** Club Heads can broadcast messages to all members, which instantly triggers in-app notifications.
- **Public Profiles:** View detailed user profiles including bios, skills, projects, and club memberships.

### 📅 Events & Fests
- Create standalone events or link them to larger Major Fests.
- **Interactive Calendar:** A visual, monthly calendar view of all campus events.
- **Registration:** Students can register for events with one click.
- **Attendee Management:** Club Heads can view registered students and check them in on the day of the event.

### 💼 Recruitment & Opportunities
- **Recruitment Workflows:** Club Heads post recruitment notices, and students apply with a custom pitch.
- **External Opportunities:** Faculty and Admin can post external hackathons, workshops, and conferences.
- **Moderation Queue:** All external opportunities must be approved by an Admin before they appear on the student feed.
- **In-App Messaging:** A direct chat system between students and club heads with auto-polling.

### ⚡ Admin Analytics & Governance
- **Recharts Dashboard:** Visual pie and bar charts showing user distribution and platform content activity.
- **Audit Logs:** Immutable history of all governance actions (approvals, suspensions, renewals) with timestamps and actor details.
- **CSV Export:** Download the complete user database directly to a spreadsheet.
- **Global Search:** A unified search bar in the navbar to instantly find users, clubs, events, and opportunities.

### 🎨 UI/UX Excellence
- Stunning, animated **Landing Page**.
- **Dark Mode** support across the entire application.
- Glassmorphism design with animated background blobs.
- Fully responsive, mobile-friendly layout with smooth Framer Motion animations.

---

## 🛠️ Technology Stack

**Frontend:**
- React 19 (via Vite)
- TypeScript
- Tailwind CSS (Styling & Dark Mode)
- React Router (Navigation)
- TanStack Query & Axios (API & State)
- Framer Motion (Animations)
- Recharts (Analytics Charts)
- Lucide React (Icons)

**Backend:**
- NestJS (Modular Monolith)
- TypeScript
- Prisma ORM
- Passport.js (JWT Strategy)
- Argon2 (Password Hashing)
- Multer (File & Image Uploads)

**Database:**
- PostgreSQL

**Monorepo Management:**
- pnpm Workspaces

---

## 🏗️ System Architecture

CampusHub is built as an **API-first modular monolith**. This architectural style was chosen to reduce deployment complexity while maintaining logical separation of concerns.

1.  **Client (React SPA):** Handles UI, state, and routing. Communicates with the backend via REST API.
2.  **API Layer (NestJS):** Intercepts all requests. Enforces JWT validation, RBAC Guards, and business logic before interacting with the database.
3.  **Database (PostgreSQL):** Enforces strict relational integrity (e.g., preventing duplicate memberships or double event registrations) via Prisma migrations.

---

## ⚙️ Local Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher)
- [pnpm](https://pnpm.io/) (v10 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v16 or higher) installed and running locally.

### Step-by-Step Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AtharvaShinde-529/CampusHub.git
   cd CampusHub
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Navigate to `apps/api` and create a `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/campushub?schema=public"
   JWT_SECRET="super-secret-change-this-in-production"
   JWT_EXPIRES_IN="15m"
   ```
   *(Make sure to replace `YOUR_PASSWORD` with your actual PostgreSQL password).*

4. **Push the Database Schema:**
   ```bash
   cd apps/api
   pnpm dlx prisma@5.22.0 db push
   ```

5. **Seed the Database:**
   This will generate 100 students, 10 faculty members, 20 active clubs, events, and recruitment cycles with Indian names and custom credentials.
   ```bash
   pnpm dlx prisma@5.22.0 db seed
   ```

6. **Start the Backend Server:**
   ```bash
   pnpm run start:dev
   ```
   *(The backend will run on `http://localhost:3000`)*

7. **Start the Frontend (in a new terminal):**
   ```bash
   cd apps/web
   pnpm run dev
   ```
   *(The frontend will run on `http://localhost:5173`)*

---

## 🔐 Test Credentials

After running the seed script, you can log in using the following accounts. All generated student and faculty accounts use their First Name for both the email and password.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@campushub.com` | `password123` |
| **Faculty** | `Aarav@campushub.com` | `Aarav123` |
| **Student (Club Head)** | `Shaurya@campushub.com` | `Shaurya123` |
| **Student (Member)** | `Ananya@campushub.com` | `Ananya123` |

*(You can also explore other accounts like `Rohan@campushub.com` / `Rohan123`, `Priya@campushub.com` / `Priya123`, etc.)*

---

## 📂 Project Structure

```text
CampusHub/
├── apps/
│   ├── api/               # NestJS Backend
│   │   ├── prisma/        # Database schema and seed scripts
│   │   ├── src/           # Source code (Auth, Users, Events, etc.)
│   │   └── uploads/       # Local image storage for profile pictures
│   │
│   └── web/               # React + Vite Frontend
│       ├── src/
│       │   ├── api/       # Axios configuration
│       │   ├── components/# Reusable UI components (Navbar, Footer)
│       │   └── pages/     # Page components (Dashboard, Admin, etc.)
│       │
├── packages/
│   └── shared/            # Shared types (currently empty, ready for future)
│
├── package.json           # Root workspace config
└── pnpm-workspace.yaml    # Monorepo configuration
```

---

## 🎓 Academic Context

This project was developed as a final-year academic submission.

- **Institution:** Vishwakarma Institute of Technology (VIT), Pune
- **Department:** Computer Science and Engineering
- **Project Guide:** Dr. Rahul Diwate

**Developers:**
- **Atharva Shinde** - [atharva.shinde24@vit.edu](mailto:atharva.shinde24@vit.edu)
- **Tanay Lathi** - [tanay.lathi24@vit.edu](mailto:tanay.lathi24@vit.edu)

### Project Status
✅ Completed **Stages 1 through 11**. Fulfilled all requirements defined in the Software Requirements Specification (SRS). Fully functional MVP ready for evaluation.
```
