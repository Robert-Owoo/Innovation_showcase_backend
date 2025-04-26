# Innovation Showcase Portal

## Project Overview
A web platform for students to submit, browse, and showcase innovative projects. Features include user authentication, project submission with video links, project browsing with filters, detailed project pages with comments, and an admin dashboard for approvals and moderation.

---

## Deployment Links
- **Frontend (GitHub Pages):** [Frontend Live Link](https://your-frontend-github-pages-link)
- **Backend (Render):** [Backend Live API](https://your-backend-render-link)
- **Frontend Source:** [Frontend GitHub Repo](https://github.com/yourusername/your-frontend-repo)
- **Backend Source:** [Backend GitHub Repo](https://github.com/yourusername/your-backend-repo)

---

## Login Details (Demo)
- **Student:**
  - Username: `testuser@example.com`
  - Password: `password123`
- **Admin:**
  - Username: `admin@example.com`
  - Password: `admin123`

---

## Feature Checklist

### 1. User Authentication & Project Submission (15 Marks)
- [x] Login/signup system
- [x] Students can submit projects with title, description, tags, and video links

### 2. Project Browsing & Search (15 Marks)
- [x] List of submitted projects
- [x] Thumbnail preview, student name, and short overview

### 3. Project Details Page & Comments (15 Marks)
- [x] Each project has a detailed page
- [x] Logged-in users can leave comments or feedback

### 4. Admin Dashboard & Approvals (15 Marks)
- [x] Admins approve or reject project submissions
- [x] Admin can edit or remove inappropriate content

---

## Installation Instructions

### Prerequisites
- Node.js (v16 or above)
- npm (Node Package Manager)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

### 2. Backend Setup
```bash
cd backend
npm install
# Start the backend server
npm start
```
- The backend will run on `http://localhost:5000`

### 3. Frontend Setup
If your frontend is static (HTML/CSS/JS):
- Open `frontend/index.html` in your browser

If your frontend uses npm (React, Vue, etc.):
```bash
cd frontend
npm install
npm start
```
- The frontend will run on `http://localhost:3000`

### 4. Environment Variables
- Configure backend environment variables if needed (e.g., JWT secret, database URL)

---

## Notes
- Do not commit `node_modules/` to your repository. Use `.gitignore`.
- For demo login, use the credentials above or register a new account.
- For deployment, update the deployment links above with your actual URLs.

---

## License
MIT 