# 💪 FitTracker AI — Full Stack Fitness Web App

A complete, production-ready fitness tracking web application built with React, Node.js, Express, and MongoDB. FitTracker helps users track workouts, nutrition, daily activity, set goals, and get personalized AI coaching.

---

## 🌐 Live Demo

- **Live:** [FitTracker App](https://fitaitracker.netlify.app)

---

## 📸 Screenshots

### Loading Screen
<img width="1920" height="901" alt="Loading" src="https://github.com/user-attachments/assets/bee55193-2c4d-48d3-9148-9aa0bccb733e" />

### Register
<img width="1920" height="922" alt="Register" src="https://github.com/user-attachments/assets/93d9a6c8-bc17-47e6-a4db-e4e2ae8a72f6" />

### Login
<img width="1920" height="916" alt="Login" src="https://github.com/user-attachments/assets/b47ba9d9-2753-4563-adc7-ae8eb4cfa734" />

### Home
<img width="1920" height="944" alt="Home" src="https://github.com/user-attachments/assets/6ddb8abf-86e4-4c52-9224-f5e1ba19fd6d" />

### Workouts
<img width="1920" height="919" alt="Workouts" src="https://github.com/user-attachments/assets/5acb5f78-46f7-4048-8651-a67d909b1ddf" />

### Nutrition
<img width="1920" height="931" alt="Nutrition" src="https://github.com/user-attachments/assets/271dfff9-4a36-4708-8bd1-7744310eb60d" />

### Tracking
<img width="1920" height="922" alt="Tracking" src="https://github.com/user-attachments/assets/2b80da59-6d20-40bb-b0e6-b377858433c3" />

### Goals
<img width="1920" height="913" alt="Goals" src="https://github.com/user-attachments/assets/4d59eb3b-bbb5-47de-96eb-ffd68e0679fa" />

### Reviews
<img width="1920" height="1080" alt="Reviews" src="https://github.com/user-attachments/assets/0da60bd5-9408-4208-a31f-bc4b0970a72d" />

### AI Coach
<img width="1920" height="928" alt="AI Coach" src="https://github.com/user-attachments/assets/5856f4b3-8923-4e25-a250-4fc1b78ef23d" />

### Profile
<img width="1920" height="915" alt="Profile" src="https://github.com/user-attachments/assets/a61d0462-ab72-4764-82fc-c871a3913c76" />

---

## ✨ Features

### 🔐 Authentication
- Register & Login with JWT
- Forgot password with real OTP email (Nodemailer + Gmail)
- Protected routes — all pages require authentication

### 🏠 Home Page
- Personalized dashboard
- Quick stats overview
- Navigation to all features

### 🏋️ Workout Page
- 30+ curated workout plans across 10 categories
- Categories: Weight Loss, Muscle Gain, Endurance, Flexibility, Core Strength, and more
- Difficulty meter, muscle groups, exercise tags per card
- Workout player with timer and exercise tracking
- Workout history tracking

### 🥗 Nutrition Page
- Daily food logging across Breakfast, Lunch, Dinner, Snacks
- Search from 30+ foods database
- Custom food entry
- Calorie ring with macro bars (Protein, Carbs, Fat)
- Outside food logging
- Smart nutrition tips
- Weekly calorie overview
- Auto-calculated goals from user profile

### 📊 Tracking Page
- Daily dashboard with 6 metric cards
- Steps tracker with circular progress ring
- Water intake tracker (glass-by-glass)
- Sleep tracker with bedtime/wake time input
- Calories burned logger
- Weight logger with weekly trend
- Workout logger with mark-done button
- 7-day progress charts (Chart.js)
- Goals status section
- Smart insights based on real data

### 🎯 Goals Page
- 7-step goal wizard (Goal Type → Calories → Macros → Activity → Water/Sleep → Weight Target → Summary)
- Auto-calculated TDEE, calories, and macros from user profile
- Goal types: Weight Loss, Muscle Gain, Maintain, Custom
- Active goal dashboard with progress bar
- Daily streak tracking with flexible missed-day mode
- Reports tab: Daily, Weekly, Monthly, Goal Progress
- History tab: all past goals with success rate

### 🔔 Notifications Page
- Real in-app notifications from goal system
- Types: Goal started, Day completed, Day missed, Goal complete
- Filter by All / Unread / Success / Missed
- Mark as read, Mark all read, Clear all
- Live unread count badge in navbar

### 🤖 AI Coach Page
- Powered by Groq (Llama 3.3 70B)
- Personalized responses using real user data (steps, calories, goals, sleep)
- Chat bubble UI with typing indicator
- Quick suggestion buttons
- Conversation history context

### 👤 Profile Page
- Avatar with initials
- View and edit personal info (name, age, weight, height, gender, fitness level)
- Auto-calculated BMI, BMR, TDEE
- Fitness stats (total steps, calories burned, workout days, streaks)
- Active goal summary with progress bar
- Change password

### ⭐ Reviews Page
- User reviews and ratings

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI Framework |
| Vite | Build Tool |
| React Router v6 | Client-side Routing |
| Chart.js + react-chartjs-2 | Progress Charts |
| Bootstrap 5 | Base Styling |
| CSS Modules | Custom Styling |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Bcryptjs | Password Hashing |
| Nodemailer | Email OTP |
| Groq SDK | AI Chat (Llama 3.3) |

### Deployment
| Service | Purpose |
|---|---|
| GitHub | Version Control |
| Netlify | Frontend Hosting |
| Render | Backend Hosting |
| MongoDB Atlas | Cloud Database |

---

## 📁 Project Structure

```
Fitness Website/
├── client/                   # React Frontend
│   ├── public/
│   │   ├── images/           # Local workout images
│   │   └── _redirects        # Netlify SPA routing
│   ├── src/
│   │   ├── components/
│   │   │   ├── AICoachPage/
│   │   │   ├── AboutYouPage/
│   │   │   ├── ForgotPasswordPage/
│   │   │   ├── GoalPage/
│   │   │   ├── HomePage/
│   │   │   ├── LoadingPage/
│   │   │   ├── LoginPage/
│   │   │   ├── Navbar/
│   │   │   ├── NotificationPage/
│   │   │   ├── NutritionPage/
│   │   │   ├── ProfilePage/
│   │   │   ├── RegisterPage/
│   │   │   ├── ReviewsPage/
│   │   │   ├── TrackingPage/
│   │   │   └── Workout/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                  # VITE_API_URL
│   └── netlify.toml
│
└── server/                   # Node.js Backend
    ├── controllers/
    │   ├── authController.js
    │   ├── goalController.js
    │   ├── nutritionController.js
    │   ├── profileController.js
    │   ├── trackingController.js
    │   ├── workoutController.js
    │   ├── notificationController.js
    │   └── aiController.js
    ├── models/
    │   ├── User.js
    │   ├── Goal.js
    │   ├── Nutrition.js
    │   ├── Notification.js
    │   ├── Tracking.js
    │   └── WorkoutLog.js
    ├── routes/
    │   ├── auth.js
    │   ├── goals.js
    │   ├── nutrition.js
    │   ├── profile.js
    │   ├── tracking.js
    │   ├── workout.js
    │   ├── notifications.js
    │   └── ai.js
    ├── middleware/
    │   └── auth.js
    ├── .env                  # Environment variables
    └── server.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Groq API key (free at console.groq.com)
- Gmail account with App Password

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/fitness-tracker.git
cd fitness-tracker
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

---

## 🌍 Deployment

### Backend → Render
- Connect GitHub repo
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Add all environment variables from `server/.env`

### Frontend → Netlify
- Connect GitHub repo
- Auto-detected from `netlify.toml`
- Add environment variable:
  - `VITE_API_URL` = your Render backend URL + `/api`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/forgot-password` | Send OTP email |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/profile` | Get user profile + stats |
| PUT | `/api/profile` | Update profile |
| PUT | `/api/profile/password` | Change password |
| GET | `/api/nutrition/daily` | Get daily nutrition log |
| POST | `/api/nutrition/add` | Add food item |
| GET | `/api/nutrition/weekly` | Get weekly nutrition |
| GET | `/api/nutrition/search` | Search foods |
| GET | `/api/tracking/today` | Get today's tracking |
| POST | `/api/tracking/log` | Update tracking log |
| GET | `/api/tracking/weekly` | Get weekly tracking |
| GET | `/api/goals` | Get active goal |
| POST | `/api/goals` | Create/update goal |
| GET | `/api/goals/progress` | Get goal progress |
| POST | `/api/goals/check-day` | Daily goal check |
| GET | `/api/goals/history` | Get all goals |
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/read-all` | Mark all read |
| DELETE | `/api/notifications/clear` | Clear all |
| POST | `/api/ai/chat` | AI coach chat |
| GET | `/api/workouts` | Get workouts |
| POST | `/api/workouts/log` | Log workout |

---

## 👨‍💻 Author

Built with ❤️ by **Hemapathi**

---

## 📄 License

This project is licensed under the MIT License.
