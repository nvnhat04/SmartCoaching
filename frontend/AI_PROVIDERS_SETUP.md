# 🤖 Hướng dẫn cấu hình AI Providers

Hiện ứng dụng chỉ hỗ trợ **2 provider**: **Groq** và **Google Gemini**.  
Bạn có thể chuyển đổi linh hoạt giữa 2 provider này thông qua biến môi trường.

---

## 🚀 Groq (Khuyến nghị)
- **Miễn phí**: 14,400 requests/day
- **Tốc độ**: Rất nhanh (Llama models)
- **Model mặc định**: `llama-3.1-70b-versatile`
- **Sign up**: https://console.groq.com/
- **Lấy API key**: https://console.groq.com/keys

### Cấu hình `.env.local`
```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
# (Tuỳ chọn) ghi đè model
# AI_MODEL=llama-3.1-70b-versatile
```

---

## 🔷 Google Gemini
- **Miễn phí**: Có quota giới hạn
- **Model mặc định**: `gemini-2.5-flash`
- **Sign up**: https://makersuite.google.com/app/apikey

### Cấu hình `.env.local`
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...
# (Tuỳ chọn) ghi đè model
# AI_MODEL=gemini-1.5-flash
```

---

## 🔄 Chuyển đổi giữa Groq & Gemini
1. Mở `frontend/.env.local`
2. Cập nhật `AI_PROVIDER` và API key tương ứng
3. Khởi động lại server:
   ```bash
   cd frontend
   npm run dev
   ```

Ví dụ:
```env
# Dùng Groq (mặc định)
AI_PROVIDER=groq
GROQ_API_KEY=gsk_xxxxxxxxx

# Dùng Gemini
# AI_PROVIDER=gemini
# GEMINI_API_KEY=AIzaSy...
```

---

## 🐛 Troubleshooting

### Lỗi: `missing_api_key`
- Kiểm tra đã set đúng biến môi trường chưa
- Đảm bảo restart `npm run dev` sau khi chỉnh `.env.local`

### Lỗi: `quota_exceeded`
- Nếu đang dùng Gemini → chuyển sang Groq
- Nếu đang dùng Groq → đợi reset quota hoặc chuyển sang Gemini

### Lỗi: `invalid api key`
- Kiểm tra API key còn hiệu lực và không có khoảng trắng dư

---

## 📝 Ví dụ `.env.local` đầy đủ
```env
MONGODB_URI=mongodb://localhost:27017/smart-coaching
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# AI Provider
AI_PROVIDER=groq
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
# GEMINI_API_KEY=AIzaSy... (nếu dùng Gemini)
# AI_MODEL=llama-3.1-70b-versatile
```

Chúc bạn cấu hình thành công! 💪

