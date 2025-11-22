'use client';

import { Camera } from '@mediapipe/camera_utils';
import { NormalizedLandmark, Pose, POSE_CONNECTIONS, Results } from '@mediapipe/pose';
import { useEffect, useRef, useState, useCallback } from 'react';

// =========================================
// 1. CONSTANTS & HELPER FUNCTIONS (Ngoài Component)
// =========================================

const CHECKPOINTS: Record<string, Record<string, number>> = {
  "dong_tac_1": {
    left_elbow: 6.35, right_elbow: 5.03,
    left_shoulder: 160.76, right_shoulder: 178.18,
    left_hip: 175.96, right_hip: 176.41,
    left_knee: 179.37, right_knee: 179.32
  },
  "dong_tac_2": {
    left_elbow: 88.09, right_elbow: 94.93,
    left_knee: 106.27, right_knee: 111.86,
    left_hip: 138.46, right_hip: 142.79,
    left_shoulder: 17.35, right_shoulder: 17.14,
  },
  "dong_tac_3": {
    left_elbow: 174.68, right_elbow: 169.42,
    left_knee: 124.61, right_knee: 40.42,
    left_hip: 139.35, right_hip: 89.31,
    left_shoulder: 160.33, right_shoulder: 162.25,
  }
};

const POSE_NAMES = Object.keys(CHECKPOINTS);

// Map index landmark để vẽ text
const JOINT_INDEX_MAP: Record<string, number> = {
  left_elbow: 13, right_elbow: 14,
  left_shoulder: 11, right_shoulder: 12,
  left_knee: 25, right_knee: 26,
  left_hip: 23, right_hip: 24,
};

// Tính góc giữa 3 điểm
const calculateAngle = (a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark) => {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);
  const angle = Math.acos(Math.min(Math.max(dot / (magAB * magCB), -1), 1));
  return angle * (180 / Math.PI);
};

// Trích xuất tất cả các góc cần thiết
const extractJointAngles = (L: NormalizedLandmark[]) => ({
  left_elbow: calculateAngle(L[13], L[11], L[15]),
  right_elbow: calculateAngle(L[14], L[12], L[16]),
  left_shoulder: calculateAngle(L[11], L[13], L[23]),
  right_shoulder: calculateAngle(L[12], L[14], L[24]),
  left_knee: calculateAngle(L[23], L[25], L[27]),
  right_knee: calculateAngle(L[24], L[26], L[28]),
  left_hip: calculateAngle(L[11], L[23], L[25]),
  right_hip: calculateAngle(L[12], L[24], L[26]),
});

// So sánh góc người dùng và mẫu
const comparePose = (userAngles: any, targetAngles: any) => {
  const diffs: Record<string, number> = {};
  let totalScore = 0;
  let count = 0;

  for (const joint in targetAngles) {
    const diff = Math.abs(userAngles[joint] - targetAngles[joint]);
    diffs[joint] = diff;
    // Logic chấm điểm: Sai số < 30 độ bắt đầu có điểm
    totalScore += Math.max(0, 30 - diff);
    count++;
  }

  // Normalize điểm về thang 100
  const normalizedScore = count > 0 ? (totalScore / (30 * count)) * 100 : 0;
  return { score: normalizedScore, diffs };
};

interface WebcamCaptureProps {
  active: boolean;
}

// =========================================
// 2. MAIN COMPONENT
// =========================================
export function WebcamCapture({ active }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Dùng ref để lưu logic game loop thay vì State để tránh re-render làm reset camera
  const logicState = useRef({
    poseIndex: 0,
    holdCounter: 0, // Đếm số frame giữ đúng tư thế
    isFinished: false
  });

  // State chỉ dùng để update UI hiển thị
  const [uiState, setUiState] = useState({
    score: 0,
    poseName: POSE_NAMES[0],
    progress: `1/${POSE_NAMES.length}`,
    diffs: {} as Record<string, number>,
    isGoodPose: false,
    finished: false
  });

  // Hàm vẽ (được gọi liên tục trong requestAnimationFrame của MediaPipe)
  const drawResults = useCallback((landmarks: NormalizedLandmark[]) => {
    const ctx = canvasRef.current?.getContext('2d');
    const video = videoRef.current;
    if (!ctx || !video) return;

    // 1. Vẽ video nền
    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);

    // 2. Tính toán logic
    const currentIdx = logicState.current.poseIndex;
    const currentName = POSE_NAMES[currentIdx];
    const targetAngles = CHECKPOINTS[currentName];
    
    if (!targetAngles) return; // Đã hết bài

    const userAngles = extractJointAngles(landmarks);
    const { score, diffs } = comparePose(userAngles, targetAngles);
    const isPassThreshold = score > 80; // Ngưỡng điểm để tính là đúng (đã tăng lên cho chặt chẽ)

    // 3. Logic chuyển bài (Hold Timer)
    if (isPassThreshold) {
      logicState.current.holdCounter += 1;
    } else {
      logicState.current.holdCounter = 0;
    }

    // Nếu giữ đúng tư thế trong 30 frames (khoảng 1 giây)
    const HOLD_THRESHOLD = 30;
    if (logicState.current.holdCounter > HOLD_THRESHOLD) {
        logicState.current.holdCounter = 0; // Reset counter
        
        if (currentIdx < POSE_NAMES.length - 1) {
            logicState.current.poseIndex += 1; // Next pose
            console.log("Moved to next pose:", POSE_NAMES[logicState.current.poseIndex]);
        } else {
            logicState.current.isFinished = true;
        }
    }

    // 4. Update UI State (Throttle nếu cần, ở đây update mỗi frame nhưng React 18 sẽ batching)
    setUiState({
      score,
      diffs,
      poseName: POSE_NAMES[logicState.current.poseIndex],
      progress: `${logicState.current.poseIndex + 1}/${POSE_NAMES.length}`,
      isGoodPose: isPassThreshold,
      finished: logicState.current.isFinished
    });

    // 5. Vẽ Skeleton & Debug info
    // Vẽ đường nối
    ctx.lineWidth = 2;
    POSE_CONNECTIONS.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1.visibility! > 0.5 && p2.visibility! > 0.5) {
        ctx.beginPath();
        ctx.moveTo(p1.x * ctx.canvas.width, p1.y * ctx.canvas.height);
        ctx.lineTo(p2.x * ctx.canvas.width, p2.y * ctx.canvas.height);
        ctx.strokeStyle = isPassThreshold ? '#00FF00' : '#FFFFFF'; // Xanh nếu đúng
        ctx.stroke();
      }
    });

    // Vẽ khớp và góc
    ctx.font = 'bold 14px Arial';
    ctx.textBaseline = 'bottom';
    
    for (const [joint, targetVal] of Object.entries(targetAngles)) {
      const lmIdx = JOINT_INDEX_MAP[joint];
      const lm = landmarks[lmIdx];
      if (lm && lm.visibility! > 0.5) {
        const x = lm.x * ctx.canvas.width;
        const y = lm.y * ctx.canvas.height;
        const userVal = (userAngles as any)[joint];
        const diff = Math.abs(userVal - targetVal);
        
        // Vẽ điểm khớp
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = diff < 15 ? '#00FF00' : '#FF0000';
        ctx.fill();

        // Vẽ số đo góc
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        const text = `${Math.round(userVal)}°`;
        ctx.strokeText(text, x + 10, y);
        ctx.fillText(text, x + 10, y);
      }
    }
    
    // Vẽ thanh Progress Hold
    if(logicState.current.holdCounter > 0) {
        const progress = logicState.current.holdCounter / HOLD_THRESHOLD;
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.fillRect(0, ctx.canvas.height - 10, ctx.canvas.width * progress, 10);
    }

    ctx.restore();
  }, []); // Không dependency để tránh tạo lại hàm

  // =========================================
  // 3. MEDIAPIPE SETUP
  // =========================================
  useEffect(() => {
    if (!active) return;

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results: Results) => {
      if (results.poseLandmarks) {
        drawResults(results.poseLandmarks);
      }
    });

    let camera: Camera | null = null;

    const startCamera = async () => {
      if (videoRef.current) {
        camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) await pose.send({ image: videoRef.current });
          },
          width: 640,
          height: 480,
        });
        await camera.start();
      }
    };

    startCamera();

    return () => {
      camera?.stop();
      pose.close();
    };
    // Quan trọng: Dependencies rỗng hoặc chỉ chứa 'active'. 
    // KHÔNG đưa poseIndex vào đây để tránh reset camera.
  }, [active, drawResults]);

  // =========================================
  // 4. RENDER
  // =========================================
  return (
    <div className="relative w-[640px] h-[480px] mx-auto bg-black rounded-lg overflow-hidden shadow-xl">
      <video ref={videoRef} className="hidden" muted playsInline />
      <canvas ref={canvasRef} width={640} height={480} className="w-full h-full object-cover" />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/70 to-transparent text-white">
        <div className="flex justify-between items-start">
          <div>
             <h3 className="text-xl font-bold text-yellow-400 uppercase">{uiState.poseName}</h3>
             <p className="text-sm text-gray-300">Bài tập: {uiState.progress}</p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">
                {uiState.score.toFixed(0)} <span className="text-sm font-normal text-gray-400">/ 100</span>
            </div>
            {uiState.finished ? (
                <span className="text-green-400 font-bold animate-pulse">HOÀN THÀNH! 🎉</span>
            ) : uiState.isGoodPose ? (
                <span className="text-green-400 font-bold">GIỮ NGUYÊN...</span>
            ) : (
                <span className="text-red-400">Điều chỉnh tư thế</span>
            )}
          </div>
        </div>

        {/* Debug Diffs nhỏ gọn hơn */}
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs opacity-80">
            {Object.entries(uiState.diffs).map(([k, v]) => (
                v > 15 && ( // Chỉ hiện các lỗi sai lớn để đỡ rối
                    <div key={k} className="text-red-300 flex justify-between">
                        <span>{k}</span>
                        <span>lệch {Math.round(v)}°</span>
                    </div>
                )
            ))}
        </div>
      </div>
    </div>
  );
}