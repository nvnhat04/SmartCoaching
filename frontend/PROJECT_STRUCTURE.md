# Smart Coaching - Project Structure

## 📁 Directory Structure

```
SmartCoaching/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Auth group routes
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   └── layout.tsx            # Auth layout
│   ├── (dashboard)/              # Dashboard group routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── category/             # Exercise categories
│   │   ├── practice/             # Pose detection & practice
│   │   ├── profile/              # User profile
│   │   ├── recommendation/       # AI recommendations
│   │   └── layout.tsx            # Dashboard layout
│   ├── api/                      # API routes
│   │   └── auth/                 # Authentication endpoints
│   │       ├── [...nextauth]/    # NextAuth handler
│   │       └── register/         # Registration endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (redirects)
│
├── components/                   # React components
│   ├── dashboard/                # Dashboard components
│   │   ├── StatsCard.tsx
│   │   ├── ProgressChart.tsx
│   │   ├── RecentWorkouts.tsx
│   │   └── ActivityCalendar.tsx
│   ├── category/                 # Category components
│   │   └── ExerciseGrid.tsx
│   ├── practice/                 # Practice components
│   │   ├── WebcamCapture.tsx
│   │   ├── PoseAnalysis.tsx
│   │   ├── ExerciseSelector.tsx
│   │   └── WorkoutSession.tsx
│   ├── profile/                  # Profile components
│   │   ├── ProfileForm.tsx
│   │   ├── BodyMetrics.tsx
│   │   └── GoalsSetting.tsx
│   ├── recommendation/           # Recommendation components
│   │   ├── AIChat.tsx
│   │   ├── RecommendedPlan.tsx
│   │   └── ExerciseRecommendations.tsx
│   ├── layout/                   # Layout components
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── providers/                # Context providers
│   │   └── AuthProvider.tsx
│   └── ui/                       # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Toaster.tsx
│
├── lib/                          # Utility libraries
│   ├── mongodb.ts                # MongoDB connection
│   ├── auth.ts                   # NextAuth configuration
│   ├── utils.ts                  # Helper functions
│   └── ai-service.ts             # AI service client
│
├── models/                       # MongoDB models
│   ├── User.ts
│   ├── Exercise.ts
│   ├── WorkoutSession.ts
│   └── WorkoutPlan.ts
│
├── types/                        # TypeScript types
│   ├── index.ts                  # Main types
│   └── next-auth.d.ts            # NextAuth types
│
├── ai-service/                   # Python AI Service
│   ├── main.py                   # FastAPI application
│   ├── requirements.txt          # Python dependencies
│   └── README.md                 # AI service documentation
│
├── public/                       # Static assets
│   └── (images, videos, etc.)
│
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── package.json                  # Node dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.mjs            # PostCSS configuration
├── next.config.mjs               # Next.js configuration
└── README.md                     # Project documentation
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Setup Python environment for AI service
cd ai-service
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cd ..
```

### 2. Environment Setup

Create `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/smart-coaching
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
AI_SERVICE_URL=http://localhost:8000
```

### 3. Run the Application

Terminal 1 - Next.js Frontend:
```bash
npm run dev
# App runs on http://localhost:3000
```

Terminal 2 - Python AI Service:
```bash
cd ai-service
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# API runs on http://localhost:8000
```

## 🏗️ Module Overview

### 🏠 Dashboard Module
- **Location**: `app/(dashboard)/dashboard/`
- **Components**: `components/dashboard/`
- **Features**:
  - Statistics cards (sessions, time, score, calories)
  - Progress charts (Chart.js/Recharts)
  - Recent workouts list
  - Activity calendar

### 🧩 Category Module
- **Location**: `app/(dashboard)/category/`
- **Components**: `components/category/`
- **Features**:
  - Exercise grid with cards
  - Categories: Squat, Push-up, Plank, Yoga, Stretching
  - Exercise descriptions and difficulty levels

### 🏋️ Practice Module
- **Location**: `app/(dashboard)/practice/`
- **Components**: `components/practice/`
- **Features**:
  - Real-time webcam capture
  - Pose detection with TensorFlow.js/MediaPipe
  - Live feedback and scoring
  - Rep counter
  - Color-coded status (red/yellow/green)

### 👤 Profile Module
- **Location**: `app/(dashboard)/profile/`
- **Components**: `components/profile/`
- **Features**:
  - Personal information management
  - Body metrics (BMI, weight, height)
  - Fitness goals setting
  - Integration with dashboard data

### 💬 AI Recommendation Module
- **Location**: `app/(dashboard)/recommendation/`
- **Components**: `components/recommendation/`
- **Features**:
  - AI chat interface
  - Personalized workout plans
  - Exercise recommendations
  - 7-day/30-day programs

## 🤖 AI Service

### Technology Stack
- **FastAPI**: REST API framework
- **MediaPipe**: Pose detection
- **OpenCV**: Image processing
- **NumPy**: Numerical computations

### Endpoints
- `POST /api/pose/detect` - Analyze pose from image
- `GET /api/recommendations/{user_id}` - Get recommendations
- `POST /api/plan/generate` - Generate workout plan
- `POST /api/chat` - AI chat interface

### Pose Analysis
- Real-time keypoint detection
- Angle calculation for joints
- Exercise-specific scoring
- Feedback generation

## 🗄️ Database Schema

### Collections
- **users**: User accounts and profiles
- **exercises**: Exercise library
- **workoutSessions**: Training history
- **workoutPlans**: Personalized plans

## 🎨 UI/UX

### Design System
- **Colors**: Primary blue (#0ea5e9), Success green, Warning yellow, Error red
- **Typography**: Inter font family
- **Components**: Consistent button, input, card styles
- **Responsive**: Mobile-first design with Tailwind CSS

### Navigation
- Sidebar navigation for main modules
- Header with user info and notifications
- Breadcrumbs for deep navigation

## 📊 Data Flow

1. **User Authentication**: NextAuth → MongoDB
2. **Pose Detection**: Webcam → Canvas → Base64 → AI Service → Response
3. **Workout Tracking**: Session data → MongoDB → Dashboard
4. **Recommendations**: User profile + History → AI Service → Recommendations

## 🔐 Security

- Bcrypt password hashing
- JWT session tokens
- CORS configuration
- Environment variable protection

## 📝 Next Steps

1. **Install dependencies**: `npm install`
2. **Setup MongoDB**: Local or cloud instance
3. **Configure environment**: Copy `.env.example` to `.env.local`
4. **Install Python deps**: `cd ai-service && pip install -r requirements.txt`
5. **Run development servers**: Frontend (3000) + AI Service (8000)
6. **Test the application**: Register → Login → Practice

## 🛠️ Development Tips

- Use TypeScript for type safety
- Follow component naming conventions
- Keep components small and focused
- Use custom hooks for reusable logic
- Test AI service endpoints with FastAPI docs (http://localhost:8000/docs)

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MediaPipe Pose](https://google.github.io/mediapipe/solutions/pose)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [TensorFlow.js](https://www.tensorflow.org/js)
