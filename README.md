# Skill Barter - Skill Swap Platform

## 🚀 Problem Statement

Problem Statement 1: Skill Swap Platform – Odoo Hackathon 2025

Build a mini web application that enables users to list their skills and request others in return. The platform should allow users to:

- Create and manage a public or private profile
- Add skills they offer and skills they want to learn
- Search other users by skill
- Send, accept, or reject skill swap requests
- View pending or completed swaps
- Leave feedback or ratings after a successful swap

This platform promotes collaborative learning and community upskilling by facilitating direct peer-to-peer skill exchanges.

---

## 👥 Team Name

sonivinit54

---

## 📧 Team Members & Emails

- Shivam Agrawal – agrawalshivam813@gmail.com  
- Vinit Soni – Sonivinit54@gmail.com  
- Varun Choudhary – teammate3@example.com  

---

## 🔧 Tech Stack

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi
- **File Upload:** Cloudinary
- **Real-time:** Socket.IO
- **Security:** Helmet, CORS, bcryptjs

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** TailwindCSS
- **Routing:** React Router DOM
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Real-time:** Socket.IO Client
- **Forms:** React Hook Form
- **Notifications:** React Hot Toast
- **Icons:** Lucide React

### Development Tools
- **Package Manager:** npm
- **Linting:** ESLint
- **Build Tool:** Vite
- **Database Management:** Prisma Studio

---

## 📂 Features Implemented

### ✅ Core Features
- **User Authentication:** Complete signup/login system with JWT
- **Profile Management:** Public/private profiles with bio, location, and photo
- **Skills System:** Add offered and wanted skills with proficiency levels
- **User Search:** Find users by skills and location
- **Swap Requests:** Send, accept, reject, and manage skill swap requests
- **Feedback System:** Rate and review completed swaps
- **Real-time Notifications:** Live updates for swap requests and messages
- **Responsive Design:** Mobile-first approach with TailwindCSS

### 🔄 In Progress
- Advanced search and filtering
- Skill categories and tags
- Availability scheduling
- Chat system for swap coordination

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-team/skill-barter.git
cd skill-barter
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Set up environment variables**
```bash
# Backend
cd ../backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# CORS
FRONTEND_URL="http://localhost:3000"
```

4. **Set up the database**
```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **Start the development servers**
```bash
# Start backend (in backend directory)
npm run dev

# Start frontend (in frontend directory, new terminal)
cd ../frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Prisma Studio: http://localhost:5555 (run `npx prisma studio`)

---

## 📁 Project Structure

```
skill-barter/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js           # Database seeding
│   ├── src/
│   │   ├── middleware/       # Auth & error handling
│   │   ├── routes/           # API endpoints
│   │   ├── validations/      # Input validation
│   │   └── server.js         # Main server file
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/search` - Search users by skills

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create custom skill
- `GET /api/skills/categories` - Get skill categories

### Swaps
- `GET /api/swaps` - Get user's swaps
- `POST /api/swaps` - Create swap request
- `PUT /api/swaps/:id` - Update swap status
- `DELETE /api/swaps/:id` - Cancel swap

### Feedback
- `GET /api/feedback` - Get user feedback
- `POST /api/feedback` - Submit feedback
- `PUT /api/feedback/:id` - Update feedback

---

## 🛠️ Development

### Database Commands
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Seed database
npm run db:seed
```

### Available Scripts

**Backend:**
- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database (e.g., on Railway, Supabase, or AWS RDS)
2. Configure environment variables
3. Deploy to platform of choice (Railway, Render, Heroku, etc.)

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to Vercel, Netlify, or similar platform
3. Configure environment variables for API endpoints

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

This project is part of the Odoo Hackathon 2025.

---

## 🆘 Support

For support, email agrawalshivam813@gmail.com or create an issue in the repository.
