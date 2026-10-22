# 🎓 CampusHub

**A Unified Campus Engagement, Opportunities and Student Participation Platform.**

CampusHub is a full-stack, role-aware web application designed to eliminate the fragmentation of campus activities, clubs, events, and external opportunities. It provides a centralized digital environment for students, faculty, and administrators to connect, discover, and participate in campus life.

## 🚀 Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Admins, Faculty, Club Heads, Committee Members, and Students.
- **Unified Campus Feed:** A central dashboard aggregating upcoming events, external opportunities, and joined clubs.
- **Organizations & Clubs:** Discover, join, and manage clubs. Admin approval is required for new clubs.
- **Recruitment Workflows:** Club Heads can post recruitment notices, and students can apply directly through the platform.
- **Event & Fest Management:** Create standalone events or link them to larger fests. Students can register with one click.
- **External Opportunities:** Faculty and Admin can post hackathons/workshops which go through an Admin moderation queue before going live.
- **Faculty Mentorship:** Admins can assign Faculty Guardians to specific clubs, unlocking dedicated mentor dashboards.
- **In-App Notifications:** Real-time alerts for application updates and new recruitment postings.
- **Campus Exchange:** A Lost & Found / Buy & Sell board for students.
- **Admin Analytics:** Live metrics on total students, faculty, active clubs, and pending approvals.

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, React Router, Axios, Lucide Icons.
- **Backend:** NestJS, TypeScript, Passport.js (JWT), Argon2 (Password Hashing).
- **Database:** PostgreSQL, Prisma ORM.
- **Monorepo Management:** pnpm Workspaces.

## ⚙️ Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/AtharvaShinde-529/CampusHub.git
   cd CampusHub
   ```

2. Install dependencies (at the root):
   ```bash
   pnpm install
   ```

3. Set up the `.env` file in `apps/api`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campushub?schema=public"
   JWT_SECRET="super-secret-change-this-in-production"
   JWT_EXPIRES_IN="15m"
   ```

4. Push the database schema:
   ```bash
   cd apps/api
   pnpm dlx prisma@5.22.0 db push
   ```

5. Seed the database (creates 100 students, 10 faculty, and 20 clubs):
   ```bash
   pnpm dlx prisma@5.22.0 db seed
   ```

6. Start the Backend:
   ```bash
   pnpm run start:dev
   ```

7. Start the Frontend (in a new terminal):
   ```bash
   cd apps/web
   pnpm run dev
   ```

## 🔐 Test Credentials (after seeding)

- **Admin:** `admin@campushub.com` / `password123`
- **Faculty:** `Aarav@campushub.com` / `Aarav123`
- **Student (Club Head):** `Shaurya@campushub.com` / `Shaurya123`
- **Student (Member):** `Ananya@campushub.com` / `Ananya123`

## 📌 Project Status
Completed Stages 1 through 10, fulfilling all requirements defined in the Software Requirements Specification (SRS).
