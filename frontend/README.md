# Smart Coaching - AI-Powered Fitness Application

## 🎯 Mô tả dự án
Smart Coaching là ứng dụng tập luyện thông minh sử dụng AI để phân tích tư thế, đếm số lần lặp, và đưa ra khuyến nghị cá nhân hóa.

## 🏗️ Kiến trúc hệ thống

### Frontend (Next.js)
- **Dashboard**: Thống kê và theo dõi tiến trình
- **Category**: Danh mục bài tập
- **Practice**: Webcam real-time pose analysis
- **Profile**: Quản lý thông tin cá nhân
- **AI Recommendation**: Tư vấn bài tập phù hợp

### Backend
- **Next.js API Routes**: REST API cho frontend
- **Python AI Service**: MediaPipe + FastAPI cho pose detection
- **MongoDB**: Lưu trữ dữ liệu người dùng và lịch sử tập

## 🚀 Cài đặt

### Prerequisites
- Node.js >= 18.x
- Python >= 3.9
- MongoDB >= 6.0

### Frontend Setup
```bash
npm install
npm run dev
```

### Database Seeding
Create admin account and sample data:

```bash
# Quick: Create only admin user
npm run seed:admin

# Full: Create admin + sample users + exercises
npm run seed:full
```

**Admin Credentials:**
- Email: `admin@smartcoaching.com`
- Password: `admin123`

### AI Service Setup
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Environment Variables
Create `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/smart-coaching
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
AI_SERVICE_URL=http://localhost:8000
```

## 📁 Cấu trúc thư mục

```
SmartCoaching/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth layouts
│   ├── dashboard/         # Dashboard module
│   ├── category/          # Exercise categories
│   ├── practice/          # Pose analysis
│   ├── profile/           # User profile
│   ├── recommendation/    # AI recommendations
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities & configs
├── models/                # MongoDB models
├── types/                 # TypeScript definitions
├── ai-service/            # Python AI service
└── public/                # Static assets
```

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Visualization**: Chart.js, Recharts
- **AI/ML**: TensorFlow.js, MediaPipe (Python)
- **Backend**: FastAPI (Python), Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js

## 📊 Tính năng chính

1. **Real-time Pose Detection**: Phân tích tư thế qua webcam
2. **Progress Tracking**: Theo dõi tiến trình tập luyện
3. **AI Recommendations**: Đề xuất bài tập cá nhân hóa
4. **Rep Counter**: Tự động đếm số lần lặp
5. **Video Playback**: Xem lại video buổi tập

## 📝 License
MIT
