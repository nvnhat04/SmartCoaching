import argparse
import cv2
import mediapipe as mp
import numpy as np
import json
import os
import sys
import platform
import traceback
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import asyncio

try:
    import tkinter as tk
except Exception:
    tk = None

load_dotenv()

mongodb_client = None
mongodb_db = None
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

def calculate_angle(a, b, c):
    """
    Hàm tính góc giữa 3 điểm - GIỐNG HOÀN TOÀN WebcamCapture.tsx
    Sử dụng công thức vector: arccos(dot product / (magnitude1 * magnitude2))
    
    Args:
        a: Point đầu [x, y]
        b: Point giữa (vertex) [x, y]
        c: Point cuối [x, y]
    
    Returns:
        angle: Góc tại điểm b (độ)
    """
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    ab = a - b  # { x: a.x - b.x, y: a.y - b.y }
    cb = c - b  # { x: c.x - b.x, y: c.y - b.y }
    
    dot = ab[0] * cb[0] + ab[1] * cb[1]
    
    mag_ab = np.sqrt(ab[0]**2 + ab[1]**2)
    mag_cb = np.sqrt(cb[0]**2 + cb[1]**2)
    
    cos_angle = np.clip(dot / (mag_ab * mag_cb), -1.0, 1.0)
    angle = np.arccos(cos_angle)
    
    angle_degrees = angle * 180.0 / np.pi
    
    return angle_degrees

def get_all_angles(landmarks, mp_pose):
    """
    Tính toán các góc - GIỐNG HOÀN TOÀN extractJointAngles trong WebcamCapture.tsx
    
    Mapping:
    - left_elbow: góc tại L[13] giữa L[11]-L[13]-L[15]
    - right_elbow: góc tại L[14] giữa L[12]-L[14]-L[16]
    - left_shoulder: góc tại L[11] giữa L[13]-L[11]-L[23]
    - right_shoulder: góc tại L[12] giữa L[14]-L[12]-L[24]
    - left_knee: góc tại L[25] giữa L[23]-L[25]-L[27]
    - right_knee: góc tại L[26] giữa L[24]-L[26]-L[28]
    - left_hip: góc tại L[23] giữa L[11]-L[23]-L[25]
    - right_hip: góc tại L[24] giữa L[12]-L[24]-L[26]
    """
    angles = {}
    
    try:
        L = landmarks
        
        angles['left_elbow'] = calculate_angle(
            [L[11].x, L[11].y],
            [L[13].x, L[13].y],
            [L[15].x, L[15].y]
        )
        
        angles['right_elbow'] = calculate_angle(
            [L[12].x, L[12].y],
            [L[14].x, L[14].y],
            [L[16].x, L[16].y]
        )
        
        angles['left_shoulder'] = calculate_angle(
            [L[13].x, L[13].y],
            [L[11].x, L[11].y],
            [L[23].x, L[23].y]
        )
        
        angles['right_shoulder'] = calculate_angle(
            [L[14].x, L[14].y],
            [L[12].x, L[12].y],
            [L[24].x, L[24].y]
        )

        angles['left_knee'] = calculate_angle(
            [L[23].x, L[23].y],
            [L[25].x, L[25].y],
            [L[27].x, L[27].y]
        )
        
        angles['right_knee'] = calculate_angle(
            [L[24].x, L[24].y],
            [L[26].x, L[26].y],
            [L[28].x, L[28].y]
        )
        
        angles['left_hip'] = calculate_angle(
            [L[11].x, L[11].y],
            [L[23].x, L[23].y],
            [L[25].x, L[25].y]
        )
        
        angles['right_hip'] = calculate_angle(
            [L[12].x, L[12].y],
            [L[24].x, L[24].y],
            [L[26].x, L[26].y]
        )
        
        for key in angles:
            angles[key] = round(angles[key], 2)
        
    except Exception as e:
        print(f"Lỗi khi tính góc: {e}")
        return None
        
    return angles

VIDEO_FILE = None
OUTPUT_FILE = None

checkpoints_data = {}

async def connect_mongodb():
    """Connect to MongoDB"""
    global mongodb_client, mongodb_db
    mongodb_uri = os.getenv("MONGODB_URI")
    
    if not mongodb_uri:
        print("MONGODB_URI not found in .env file. Will only save to JSON.")
        return False
    
    try:
        mongodb_client = AsyncIOMotorClient(mongodb_uri)
        db_name = mongodb_uri.split("/")[-1].split("?")[0] or "smart-coaching"
        mongodb_db = mongodb_client[db_name]
        await mongodb_client.admin.command('ping')
        print(f"Connected to MongoDB: {db_name}")
        return True
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        return False

async def save_checkpoint_to_db(checkpoint_name, angles, exercise_id, image_path):
    """
    Lưu checkpoint trực tiếp vào exercises collection theo exercise_id
    
    Args:
        checkpoint_name: Tên checkpoint (vd: "dong_tac_1")
        angles: Dict các góc {left_elbow: 6.35, ...}
        exercise_id: ID của exercise (int)
        image_path: Đường dẫn ảnh checkpoint
    """
    if mongodb_db is None:
        print("MongoDB not connected. Skipping database save.")
        return False
    
    try:
        exercises_col = mongodb_db.exercises
        
        exercise = await exercises_col.find_one({"id": exercise_id})
        if not exercise:
            print(f"Exercise ID {exercise_id} không tồn tại trong database!")
            return False
        
        checkpoint_obj = {
            "name": checkpoint_name,
            "angles": angles,
            "image_path": image_path,
            "created_at": datetime.utcnow().isoformat()
        }
        
        existing_checkpoints = exercise.get("checkpoints", [])
        checkpoint_exists = False
        
        for i, cp in enumerate(existing_checkpoints):
            if cp.get("name") == checkpoint_name:
                existing_checkpoints[i] = checkpoint_obj
                checkpoint_exists = True
                break
        
        if not checkpoint_exists:
            existing_checkpoints.append(checkpoint_obj)
        
        result = await exercises_col.update_one(
            {"id": exercise_id},
            {"$set": {"checkpoints": existing_checkpoints}}
        )
        
        if result.modified_count > 0 or result.matched_count > 0:
            action = "Updated" if checkpoint_exists else "Added"
            print(f"{action} checkpoint '{checkpoint_name}' for Exercise ID {exercise_id}")
            print(f"   Exercise: {exercise.get('name', 'Unknown')}")
            print(f"   Total checkpoints: {len(existing_checkpoints)}")
            return True
        else:
            print(f"No changes made for Exercise ID {exercise_id}")
            return False
        
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")
        traceback.print_exc()
        return False

def scale_frame_for_display(frame, max_width=None, max_height=None):
    if frame is None:
        return None, (0, 0)
    if max_width is None or max_height is None:
        sw = sh = None
        try:
            if tk is not None:
                root = tk.Tk()
                root.withdraw()
                sw = root.winfo_screenwidth()
                sh = root.winfo_screenheight()
                root.destroy()
        except Exception:
            sw = sh = None

        if sw is None or sh is None:

            h, w = frame.shape[:2]
            sw, sh = max(w, 1280), max(h, 720)

        max_width = int(sw * 0.98)
        max_height = int(sh * 0.92)
    h, w = frame.shape[:2]
    scale = min(max_width / w, max_height / h, 1.0)
    new_w = int(w * scale)
    new_h = int(h * scale)
    if (new_w, new_h) == (w, h):
        return frame, (w, h)
    resized = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)
    return resized, (new_w, new_h)


def resolve_paths(args):
    """Resolve video and output paths from args, env or defaults.
    Returns (video_file, output_file)
    """
    video = args.video
    output = args.output

    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir, os.pardir))
    default_video = os.path.join(repo_root, 'frontend', 'public', 'video_mau.mp4')
    default_output = os.path.join(repo_root, 'frontend', 'public', 'checkpoints.json')

    if not video:
        if os.path.exists(default_video):
            video = default_video
        else:
            video = input(f"Đường dẫn file video (nhấn Enter để dùng '{default_video}' nếu tồn tại): ").strip() or default_video

    if not output:
        if os.path.exists(default_output):
            output = default_output
        else:
            output = input(f"Đường dẫn file output JSON (nhấn Enter để dùng '{default_output}'): ").strip() or default_output

    video = os.path.expanduser(video)
    output = os.path.expanduser(output)
    return video, output


def main():
    parser = argparse.ArgumentParser(description='Tạo checkpoints từ video bằng MediaPipe Pose')
    parser.add_argument('-v', '--video', help='Đường dẫn tới file video')
    parser.add_argument('-o', '--output', help='Đường dẫn tới file output JSON')
    args = parser.parse_args()

    global VIDEO_FILE, OUTPUT_FILE, checkpoints_data
    VIDEO_FILE, OUTPUT_FILE = resolve_paths(args)

    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r') as f:
                checkpoints_data = json.load(f)
                print(f"Đã tải {len(checkpoints_data)} checkpoint có sẵn từ {OUTPUT_FILE}")
        except Exception as e:
            print(f"Không thể đọc file checkpoints: {e}")

    window_name = "Tao Checkpoint - Nhan 'p' de dung/tiep tuc"
    cap = cv2.VideoCapture(VIDEO_FILE)
    if not cap.isOpened():
        print(f"Lỗi: Không thể mở file video '{VIDEO_FILE}'")
        return

    is_paused = False
    last_valid_angles = None 
    last_frame = None

    try:
        with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
            cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
            while cap.isOpened():
                if not is_paused:
                    ret, frame = cap.read()
                    if not ret:
                        print("Hết video.")
                        break
                    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    image.flags.writeable = False
                    results = pose.process(image)
                    image.flags.writeable = True
                    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

                    if results.pose_landmarks:
                        current_angles = get_all_angles(results.pose_landmarks.landmark, mp_pose)
                        if current_angles:
                            last_valid_angles = current_angles
                        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

                    last_frame = image
                else:
                    image = last_frame if last_frame is not None else None


                if image is not None:
                    scaled, (sw, sh) = scale_frame_for_display(image)
                    try:
                        cv2.resizeWindow(window_name, sw, sh)
                    except Exception:
                        pass
                    cv2.imshow(window_name, scaled)

                if is_paused:
                    key = cv2.waitKey(0) & 0xFF
                else:
                    key = cv2.waitKey(30) & 0xFF

                if key == ord('q'):
                    break
                elif key == ord('p'):
                    is_paused = not is_paused
                    if is_paused:
                        print("\n--- VIDEO TAM DUNG ---")
                        print("Nhấn 'p' để tiếp tục.")
                        print("Nhấn 's' để LƯU checkpoint này.")
                        print("Nhấn 'q' để thoát.")
                    else:
                        print("Video tiếp tục...")
                elif key == ord('s') and is_paused:
                    if last_valid_angles:
                        print("\n" + "="*60)
                        print("LƯU CHECKPOINT")
                        print("="*60)
                        
                        checkpoint_name = input("Tên checkpoint (vd: 'dong_tac_1', 'dong_tac_2'): ").strip()
                        if not checkpoint_name:
                            print("Tên checkpoint không được để trống!")
                            continue
                        
                        # Hiển thị các góc đã tính
                        print("\n Các góc đã tính:")
                        for joint, angle in last_valid_angles.items():
                            print(f"   {joint}: {angle}°")
                        
                        # Hỏi Exercise ID
                        exercise_id_str = input("\n🔢 Exercise ID (vd: 1, 2, 3...): ").strip()
                        if not exercise_id_str.isdigit():
                            print("❌ Exercise ID phải là số nguyên!")
                            continue
                        
                        exercise_id = int(exercise_id_str)
                        
                        # Lưu vào JSON (backup)
                        checkpoints_data[checkpoint_name] = last_valid_angles
                        with open(OUTPUT_FILE, 'w') as f:
                            json.dump(checkpoints_data, f, indent=4)
                        print(f"\nĐã lưu vào JSON: {OUTPUT_FILE}")
                        
                        # Lưu ảnh checkpoint
                        image_path = None
                        try:
                            repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir, os.pardir))
                            image_dir = os.path.join(repo_root, 'frontend', 'public', 'image')
                            os.makedirs(image_dir, exist_ok=True)
                            safe_name = checkpoint_name.replace(' ', '_').replace('/', '_')
                            image_path = f"/image/{safe_name}.png"
                            full_image_path = os.path.join(image_dir, f"{safe_name}.png")
                            
                            if last_frame is not None:
                                cv2.imwrite(full_image_path, last_frame)
                                print(f" Đã lưu ảnh: {full_image_path}")
                            else:
                                print("Không có frame để lưu ảnh")
                        except Exception as e:
                            print(f"Lỗi khi lưu ảnh: {e}")
                        
                        # Lưu vào MongoDB
                        try:
                            print(f"\n Đang lưu vào MongoDB...")
                            loop = asyncio.new_event_loop()
                            asyncio.set_event_loop(loop)
                            connected = loop.run_until_complete(connect_mongodb())
                            
                            if connected:
                                success = loop.run_until_complete(save_checkpoint_to_db(
                                    checkpoint_name=checkpoint_name,
                                    angles=last_valid_angles,
                                    exercise_id=exercise_id,
                                    image_path=image_path
                                ))
                                
                                if success:
                                    print(f"\n HOÀN TẤT! Checkpoint '{checkpoint_name}' đã được lưu!")
                                else:
                                    print("\n Checkpoint đã lưu vào JSON nhưng có lỗi khi lưu MongoDB")
                            
                            loop.close()
                        except Exception as e:
                            print(f"❌ Lỗi MongoDB: {e}")
                            traceback.print_exc()
                        
                        print("="*60 + "\n")
                    else:
                        print("Không có dữ liệu góc hợp lệ để lưu!")
    except Exception:
        traceback.print_exc()
    finally:
        cap.release()
        cv2.destroyAllWindows()

    print(f"\nĐã lưu tổng cộng {len(checkpoints_data)} checkpoint vào file {OUTPUT_FILE}")
    print("File dữ liệu JSON:")
    print(json.dumps(checkpoints_data, indent=4))


if __name__ == '__main__':
    main()