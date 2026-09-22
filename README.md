# Skill Barter

A peer-to-peer skill exchange platform built to foster collaborative learning and community upskilling. Skill Barter allows users to list skills they possess, discover users offering skills they wish to learn, send and manage swap requests, and leave ratings upon completion.

---

## 🌟 Key Features

- 👤 **User Profiles & Privacy**: Create public or private profiles with customizable bio, avatar, and contact info.
- 🎯 **Skill Management**: Easily showcase skills you offer alongside skills you want to learn with custom proficiency levels.
- 🔍 **Discovery & Search**: Search for community members based on offered/requested skills, location, or availability.
- 🔄 **Swap Request System**: Send, accept, reject, or manage pending and completed skill exchange requests seamlessly.
- ⭐ **Feedback & Ratings**: Build trust in the community by leaving reviews and ratings after successful exchanges.
- 🔔 **Real-Time Notifications**: Instant updates on swap requests, status changes, and activity via Socket.IO.
- 📱 **Responsive UI**: Intuitive, modern design built with React, Vite, and TailwindCSS.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Styling:** TailwindCSS
- **Routing:** React Router DOM
- **State & HTTP:** React Context API & Axios
- **Real-time:** Socket.IO Client
- **Forms & UI:** React Hook Form, React Hot Toast, Lucide React

### Backend
- **Runtime:** Node.js & Express.js
- **Database & ORM:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs`
- **Validation:** Joi
- **Media Uploads:** Cloudinary
- **Real-time Engine:** Socket.IO
- **Security:** Helmet & CORS middleware

---

## 📂 Project Structure

```
skill-barter/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # PostgreSQL schema
│   │   └── seed.js            # Database seeder script
│   ├── src/
│   │   ├── middleware/        # Authentication & error handling
│   │   ├── routes/            # REST API endpoint routes
│   │   ├── validations/       # Input validation schemas
│   │   └── server.js          # Express server & WebSockets entrypoint
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React Context providers
│   │   ├── pages/             # Route page views
│   │   ├── services/          # API client services
│   │   ├── App.jsx            # Core application router
│   │   └── main.jsx           # App entry point
│   ├── package.json
│   └── vite.config.js
├── package.json               # Root scripts (Concurrently execution)
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed on your environment:
- **Node.js**: v16.x or higher
- **npm** or **yarn**
- **PostgreSQL**: Local or cloud database instance
- **Cloudinary Account**: For managing image uploads

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ShivamAgrawal0813/Skill_Barter.git
   cd Skill_Barter
   ```

2. **Install Dependencies**
   Run the root helper command to install dependencies across root, backend, and frontend:
   ```bash
   npm run install:all
   ```
   *(Or manually run `npm install` inside both `./backend` and `./frontend`)*

3. **Configure Environment Variables**

   Create a `.env` file in the `backend/` directory based on `.env.example`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/skillbarter?schema=public"

   # Authentication
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"

   # Server
   PORT=5000
   NODE_ENV="development"

   # Cloudinary Setup
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   # CORS Configuration
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Initialize Database**
   Generate Prisma client and apply schema to your database:
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   cd ..
   ```

5. **Run Development Mode**
   Start both backend and frontend concurrently from the root folder:
   ```bash
   npm run dev
   ```

   - **Frontend App:** http://localhost:3000
   - **Backend API:** http://localhost:5000
   - **Prisma Studio (Optional):** Run `npx prisma studio` in `./backend` to view data at http://localhost:5555

---

## 🔌 API Endpoints Summary

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register a new user account |
| | `POST` | `/api/auth/login` | Authenticate user & get JWT |
| | `GET` | `/api/auth/me` | Retrieve authenticated user profile |
| **Users** | `GET` | `/api/users` | List users |
| | `GET` | `/api/users/:id` | Get public profile details |
| | `PUT` | `/api/users/:id` | Update profile information |
| | `GET` | `/api/users/search` | Filter/search users by skill |
| **Skills** | `GET` | `/api/skills` | List available skills |
| | `POST` | `/api/skills` | Add a custom skill |
| | `GET` | `/api/skills/categories` | Fetch skill categories |
| **Swaps** | `GET` | `/api/swaps` | List user's active/past swap requests |
| | `POST` | `/api/swaps` | Create a new swap request |
| | `PUT` | `/api/swaps/:id` | Update swap status (accept/reject/complete) |
| | `DELETE` | `/api/swaps/:id` | Cancel a pending swap request |
| **Feedback**| `GET` | `/api/feedback` | Retrieve reviews and ratings |
| | `POST` | `/api/feedback` | Submit post-swap rating and feedback |

---

## 📜 Available NPM Scripts

From the root project directory:
- `npm run dev`: Launch both server and client in development mode concurrently.
- `npm run install:all`: Install dependencies across root, backend, and frontend directories.
- `npm run build`: Build production bundles for both backend and frontend.

Inside `./backend`:
- `npm run dev`: Start Express backend server with `nodemon`.
- `npm start`: Start server in production mode.
- `npm run db:seed`: Seed database with initial mockup data.

Inside `./frontend`:
- `npm run dev`: Launch Vite frontend server.
- `npm run build`: Compile frontend for production.
- `npm run preview`: Locally preview production build.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git checkout -b feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

