# Hướng dẫn Tạo Checkpoints từ Video

### Bước 1: Khởi động tool

```bash
cd backend
source venv/bin/activate  # Linux/Mac
# hoặc venv\Scripts\activate  # Windows

python -m app.checkpoints -v /path/to/video.mp4
```

Hoặc để tool tự tìm video mặc định:
```bash
python -m app.checkpoints
```

### Bước 2: Điều khiển video

Khi video đang chạy:
- **`p`**: Pause/Resume video
- **`q`**: Thoát
- **`s`**: Lưu checkpoint (chỉ khi đã pause)

### Bước 3: Lưu checkpoint

Khi nhấn `s` (trong trạng thái pause):

```
💾 LƯU CHECKPOINT
============================================================
Tên checkpoint (vd: 'dong_tac_1', 'dong_tac_2'): dong_tac_1

📐 Các góc đã tính:
   left_elbow: 6.35°
   right_elbow: 5.03°
   left_shoulder: 160.76°
   right_shoulder: 178.18°
   left_hip: 175.96°
   right_hip: 176.41°
   left_knee: 179.37°
   right_knee: 179.32°

🔢 Exercise ID (vd: 1, 2, 3...): 1

✅ Đã lưu vào JSON: .../checkpoints.json
✅ Đã lưu ảnh: .../frontend/public/image/dong_tac_1.png
✅ Connected to MongoDB: smart-coaching
✅ Added checkpoint 'dong_tac_1' for Exercise ID 1
   Exercise: Nhịp 1-8
   Total checkpoints: 1

Checkpoint 'dong_tac_1' đã được lưu!