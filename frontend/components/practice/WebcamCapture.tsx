"use client";

import { useSaveWorkoutResult } from "@/hooks/useWorkoutResults";
import { Camera } from "@mediapipe/camera_utils";
import {
  NormalizedLandmark,
  Pose,
  POSE_CONNECTIONS,
  Results,
} from "@mediapipe/pose";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

// =========================================
// 1. CONSTANTS & HELPER FUNCTIONS (Ngoài Component)
// =========================================

const CHECKPOINTS: Record<string, Record<string, number>> = {
  dong_tac_1: {
    left_elbow: 6.35,
    right_elbow: 5.03,
    left_shoulder: 160.76,
    right_shoulder: 178.18,
    left_hip: 175.96,
    right_hip: 176.41,
    left_knee: 179.37,
    right_knee: 179.32,
  },
  dong_tac_2: {
    left_elbow: 88.09,
    right_elbow: 94.93,
    left_knee: 106.27,
    right_knee: 111.86,
    left_hip: 138.46,
    right_hip: 142.79,
    left_shoulder: 17.35,
    right_shoulder: 17.14,
  },
  dong_tac_3: {
    left_elbow: 174.68,
    right_elbow: 169.42,
    left_knee: 124.61,
    right_knee: 40.42,
    left_hip: 139.35,
    right_hip: 89.31,
    left_shoulder: 160.33,
    right_shoulder: 162.25,
  },
};

// Mapping tên động tác với tên file ảnh
const CHECKPOINT_IMAGES: Record<string, string> = {
  dong_tac_1: "/img/nhip_01.png",
  dong_tac_2: "/img/nhip_02.png",
  dong_tac_3: "/img/nhip_03.png",
  dong_tac_4: "/img/nhip_04.png",
  dong_tac_5: "/img/nhip_05.png",
  dong_tac_6: "/img/nhip_06.png",
  dong_tac_7: "/img/nhip_07.png",
  dong_tac_8: "/img/nhip_08.png",
};

// Helper function để map tên động tác với ảnh (hỗ trợ nhiều format)
const getCheckpointImage = (poseName: string): string | null => {
  // Thử trực tiếp
  if (CHECKPOINT_IMAGES[poseName]) return CHECKPOINT_IMAGES[poseName];
  
  // Thử extract số từ tên (vd: "nhip_1_8" -> 1)
  const match = poseName.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1]);
    const key = `dong_tac_${num}`;
    if (CHECKPOINT_IMAGES[key]) return CHECKPOINT_IMAGES[key];
  }
  
  return null;
};

const POSE_NAMES = Object.keys(CHECKPOINTS);

// Map index landmark để vẽ text
const JOINT_INDEX_MAP: Record<string, number> = {
  left_elbow: 13,
  right_elbow: 14,
  left_shoulder: 11,
  right_shoulder: 12,
  left_knee: 25,
  right_knee: 26,
  left_hip: 23,
  right_hip: 24,
};

// Tính góc giữa 3 điểm
const calculateAngle = (
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
) => {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);
  const angle = Math.acos(Math.min(Math.max(dot / (magAB * magCB), -1), 1));
  return angle * (180 / Math.PI);
};

// Trích xuất tất cả các góc cần thiết
// QUAN TRỌNG: Thứ tự tham số phải khớp với checkpoints.py
// calculateAngle(a, b, c) tính góc TẠI điểm b
const extractJointAngles = (L: NormalizedLandmark[]) => ({
  left_elbow: calculateAngle(L[11], L[13], L[15]),    // shoulder-elbow-wrist (góc tại elbow)
  right_elbow: calculateAngle(L[12], L[14], L[16]),   // shoulder-elbow-wrist (góc tại elbow)
  left_shoulder: calculateAngle(L[13], L[11], L[23]), // elbow-shoulder-hip (góc tại shoulder)
  right_shoulder: calculateAngle(L[14], L[12], L[24]),// elbow-shoulder-hip (góc tại shoulder)
  left_knee: calculateAngle(L[23], L[25], L[27]),     // hip-knee-ankle (góc tại knee)
  right_knee: calculateAngle(L[24], L[26], L[28]),    // hip-knee-ankle (góc tại knee)
  left_hip: calculateAngle(L[11], L[23], L[25]),      // shoulder-hip-knee (góc tại hip)
  right_hip: calculateAngle(L[12], L[24], L[26]),     // shoulder-hip-knee (góc tại hip)
});

// Vẽ skeleton mẫu từ góc checkpoint
// Sử dụng hệ tọa độ đơn giản: góc càng lớn càng duỗi thẳng
const drawReferenceSkeletonFromAngles = (
  ctx: CanvasRenderingContext2D,
  targetAngles: Record<string, number>,
  baseX: number,
  baseY: number,
  scale: number = 1
) => {
  // Chiều dài khớp
  const shoulderWidth = 70 * scale;
  const upperArmLength = 90 * scale;
  const forearmLength = 90 * scale;
  const torsoLength = 120 * scale;
  const hipWidth = 60 * scale;
  const thighLength = 110 * scale;
  const shinLength = 110 * scale;

  ctx.save();
  ctx.strokeStyle = "#00BFFF";
  ctx.lineWidth = 4;
  ctx.fillStyle = "#00BFFF";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // ========== CƠ THỂ CƠ BẢN ==========
  // Vai (shoulders)
  const leftShoulderX = baseX - shoulderWidth / 2;
  const leftShoulderY = baseY;
  const rightShoulderX = baseX + shoulderWidth / 2;
  const rightShoulderY = baseY;

  // Hông (hips)
  const leftHipX = baseX - hipWidth / 2;
  const leftHipY = baseY + torsoLength;
  const rightHipX = baseX + hipWidth / 2;
  const rightHipY = baseY + torsoLength;

  // Vẽ torso
  ctx.beginPath();
  ctx.moveTo(leftShoulderX, leftShoulderY);
  ctx.lineTo(rightShoulderX, rightShoulderY);
  ctx.lineTo(rightHipX, rightHipY);
  ctx.lineTo(leftHipX, leftHipY);
  ctx.closePath();
  ctx.stroke();

  // ========== CÁNH TAY TRÁI ==========
  // left_shoulder angle: góc ở vai (elbow-shoulder-hip)
  // Góc này quyết định hướng của upper arm
  // 180° = tay duỗi xuống thẳng, 90° = tay ngang, 0° = tay lên trên
  const leftShoulderAngle = targetAngles.left_shoulder;
  // Chuyển từ góc anatomy sang góc vẽ (0° = phải, 90° = xuống)
  const leftUpperArmAngle = 90 + (180 - leftShoulderAngle);
  const leftUpperArmRad = (leftUpperArmAngle * Math.PI) / 180;
  
  const leftElbowX = leftShoulderX + Math.cos(leftUpperArmRad) * upperArmLength;
  const leftElbowY = leftShoulderY + Math.sin(leftUpperArmRad) * upperArmLength;

  ctx.beginPath();
  ctx.moveTo(leftShoulderX, leftShoulderY);
  ctx.lineTo(leftElbowX, leftElbowY);
  ctx.stroke();

  // left_elbow angle: góc ở khuỷu tay (shoulder-elbow-wrist)
  // 180° = tay duỗi thẳng, 90° = gập vuông góc, 0° = gập hoàn toàn
  const leftElbowAngle = targetAngles.left_elbow;
  // Góc bẻ của forearm so với upper arm
  const leftElbowBend = 180 - leftElbowAngle; // Độ bẻ (0° = thẳng, 180° = gập hết)
  const leftForearmAngle = leftUpperArmAngle + leftElbowBend;
  const leftForearmRad = (leftForearmAngle * Math.PI) / 180;
  
  const leftWristX = leftElbowX + Math.cos(leftForearmRad) * forearmLength;
  const leftWristY = leftElbowY + Math.sin(leftForearmRad) * forearmLength;

  ctx.beginPath();
  ctx.moveTo(leftElbowX, leftElbowY);
  ctx.lineTo(leftWristX, leftWristY);
  ctx.stroke();

  // ========== CÁNH TAY PHẢI ==========
  const rightShoulderAngle = targetAngles.right_shoulder;
  const rightUpperArmAngle = 90 - (180 - rightShoulderAngle);
  const rightUpperArmRad = (rightUpperArmAngle * Math.PI) / 180;
  
  const rightElbowX = rightShoulderX + Math.cos(rightUpperArmRad) * upperArmLength;
  const rightElbowY = rightShoulderY + Math.sin(rightUpperArmRad) * upperArmLength;

  ctx.beginPath();
  ctx.moveTo(rightShoulderX, rightShoulderY);
  ctx.lineTo(rightElbowX, rightElbowY);
  ctx.stroke();

  const rightElbowAngle = targetAngles.right_elbow;
  const rightElbowBend = 180 - rightElbowAngle;
  const rightForearmAngle = rightUpperArmAngle - rightElbowBend;
  const rightForearmRad = (rightForearmAngle * Math.PI) / 180;
  
  const rightWristX = rightElbowX + Math.cos(rightForearmRad) * forearmLength;
  const rightWristY = rightElbowY + Math.sin(rightForearmRad) * forearmLength;

  ctx.beginPath();
  ctx.moveTo(rightElbowX, rightElbowY);
  ctx.lineTo(rightWristX, rightWristY);
  ctx.stroke();

  // ========== CHÂN TRÁI ==========
  const leftHipAngle = targetAngles.left_hip;
  const leftThighAngle = 90 + (180 - leftHipAngle);
  const leftThighRad = (leftThighAngle * Math.PI) / 180;
  
  const leftKneeX = leftHipX + Math.cos(leftThighRad) * thighLength;
  const leftKneeY = leftHipY + Math.sin(leftThighRad) * thighLength;

  ctx.beginPath();
  ctx.moveTo(leftHipX, leftHipY);
  ctx.lineTo(leftKneeX, leftKneeY);
  ctx.stroke();

  const leftKneeAngle = targetAngles.left_knee;
  const leftKneeBend = 180 - leftKneeAngle;
  const leftShinAngle = leftThighAngle + leftKneeBend;
  const leftShinRad = (leftShinAngle * Math.PI) / 180;
  
  const leftAnkleX = leftKneeX + Math.cos(leftShinRad) * shinLength;
  const leftAnkleY = leftKneeY + Math.sin(leftShinRad) * shinLength;

  ctx.beginPath();
  ctx.moveTo(leftKneeX, leftKneeY);
  ctx.lineTo(leftAnkleX, leftAnkleY);
  ctx.stroke();

  // ========== CHÂN PHẢI ==========
  const rightHipAngle = targetAngles.right_hip;
  const rightThighAngle = 90 - (180 - rightHipAngle);
  const rightThighRad = (rightThighAngle * Math.PI) / 180;
  
  const rightKneeX = rightHipX + Math.cos(rightThighRad) * thighLength;
  const rightKneeY = rightHipY + Math.sin(rightThighRad) * thighLength;

  ctx.beginPath();
  ctx.moveTo(rightHipX, rightHipY);
  ctx.lineTo(rightKneeX, rightKneeY);
  ctx.stroke();

  const rightKneeAngle = targetAngles.right_knee;
  const rightKneeBend = 180 - rightKneeAngle;
  const rightShinAngle = rightThighAngle - rightKneeBend;
  const rightShinRad = (rightShinAngle * Math.PI) / 180;
  
  const rightAnkleX = rightKneeX + Math.cos(rightShinRad) * shinLength;
  const rightAnkleY = rightKneeY + Math.sin(rightShinRad) * shinLength;

  ctx.beginPath();
  ctx.moveTo(rightKneeX, rightKneeY);
  ctx.lineTo(rightAnkleX, rightAnkleY);
  ctx.stroke();

  // ========== VẼ CÁC KHỚP ==========
  const joints = [
    { x: leftShoulderX, y: leftShoulderY, label: "LS" },
    { x: rightShoulderX, y: rightShoulderY, label: "RS" },
    { x: leftElbowX, y: leftElbowY, label: "LE" },
    { x: rightElbowX, y: rightElbowY, label: "RE" },
    { x: leftWristX, y: leftWristY, label: "LW" },
    { x: rightWristX, y: rightWristY, label: "RW" },
    { x: leftHipX, y: leftHipY, label: "LH" },
    { x: rightHipX, y: rightHipY, label: "RH" },
    { x: leftKneeX, y: leftKneeY, label: "LK" },
    { x: rightKneeX, y: rightKneeY, label: "RK" },
    { x: leftAnkleX, y: leftAnkleY, label: "LA" },
    { x: rightAnkleX, y: rightAnkleY, label: "RA" },
  ];

  joints.forEach(({ x, y }) => {
    // Outer glow
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(0, 191, 255, 0.3)";
    ctx.fill();
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#00BFFF";
    ctx.fill();
    
    // White core
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
  });

  ctx.restore();
};

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
  checkpoints?: Array<{
    name: string;
    angles: Record<string, number>;
  }>;
  exerciseId?: string;
  categoryId?: string;
}

// =========================================
// 2. MAIN COMPONENT
// =========================================
export function WebcamCapture({
  active,
  checkpoints,
  exerciseId,
  categoryId,
}: WebcamCaptureProps) {
  const { data: session } = useSession();
  const { mutate: saveWorkout } = useSaveWorkoutResult();

  // Sử dụng checkpoints từ props nếu có, nếu không dùng mặc định
  const EXERCISE_CHECKPOINTS =
    checkpoints && checkpoints.length > 0
      ? checkpoints.reduce((acc, cp) => {
          acc[cp.name] = cp.angles;
          return acc;
        }, {} as Record<string, Record<string, number>>)
      : CHECKPOINTS;

  const EXERCISE_POSE_NAMES = Object.keys(EXERCISE_CHECKPOINTS);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dùng ref để lưu logic game loop thay vì State để tránh re-render làm reset camera
  const logicState = useRef({
    poseIndex: 0,
    holdCounter: 0, // Đếm số frame giữ đúng tư thế
    isFinished: false,
    startTime: null as Date | null,
    repResults: [] as Array<{
      rep_number: number;
      score: number;
      feedback: string;
      timestamp: Date;
    }>,
    hasSaved: false,
  });

  // State chỉ dùng để update UI hiển thị
  const [uiState, setUiState] = useState({
    score: 0,
    poseName: EXERCISE_POSE_NAMES[0] || "dong_tac_1",
    progress: `1/${EXERCISE_POSE_NAMES.length}`,
    diffs: {} as Record<string, number>,
    isGoodPose: false,
    finished: false,
    userAngles: {} as Record<string, number>,
    targetAngles: {} as Record<string, number>,
  });

  // Hàm vẽ (được gọi liên tục trong requestAnimationFrame của MediaPipe)
  const drawResults = useCallback((landmarks: NormalizedLandmark[]) => {
    const ctx = canvasRef.current?.getContext("2d");
    const video = videoRef.current;
    if (!ctx || !video) return;

    // 1. Vẽ video nền
    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);

    // 2. Tính toán logic
    const currentIdx = logicState.current.poseIndex;
    const currentName = EXERCISE_POSE_NAMES[currentIdx];
    const targetAngles = EXERCISE_CHECKPOINTS[currentName];

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

      // Lưu rep result
      const feedback =
        score > 90
          ? "Xuất sắc!"
          : score > 80
          ? "Tốt"
          : score > 70
          ? "Khá"
          : "Cần cải thiện";
      logicState.current.repResults.push({
        rep_number: currentIdx + 1,
        score: Math.round(score),
        feedback,
        timestamp: new Date(),
      });

      if (currentIdx < EXERCISE_POSE_NAMES.length - 1) {
        logicState.current.poseIndex += 1; // Next pose
        console.log(
          "Moved to next pose:",
          EXERCISE_POSE_NAMES[logicState.current.poseIndex]
        );
      } else {
        logicState.current.isFinished = true;
      }
    }

    // 4. Update UI State (Throttle nếu cần, ở đây update mỗi frame nhưng React 18 sẽ batching)
    setUiState({
      score,
      diffs,
      poseName:
        EXERCISE_POSE_NAMES[logicState.current.poseIndex] || "Hoàn thành",
      progress: `${logicState.current.poseIndex + 1}/${
        EXERCISE_POSE_NAMES.length
      }`,
      isGoodPose: isPassThreshold,
      finished: logicState.current.isFinished,
      userAngles,
      targetAngles,
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
        ctx.strokeStyle = isPassThreshold ? "#00FF00" : "#FFFFFF"; // Xanh nếu đúng
        ctx.stroke();
      }
    });

    // Vẽ khớp và góc
    ctx.font = "bold 14px Arial";
    ctx.textBaseline = "bottom";

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
        ctx.fillStyle = diff < 15 ? "#00FF00" : "#FF0000";
        ctx.fill();

        // Vẽ số đo góc
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        const text = `${Math.round(userVal)}°`;
        ctx.strokeText(text, x + 10, y);
        ctx.fillText(text, x + 10, y);
      }
    }

    // Vẽ thanh Progress Hold
    if (logicState.current.holdCounter > 0) {
      const progress = logicState.current.holdCounter / HOLD_THRESHOLD;
      ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
      ctx.fillRect(0, ctx.canvas.height - 10, ctx.canvas.width * progress, 10);
    }

    ctx.restore();
  }, []); // Không dependency để tránh tạo lại hàm

  // =========================================
  // 3. AUTO-SAVE WHEN FINISHED OR STOPPED
  // =========================================
  const saveWorkoutResults = useCallback(() => {
    // Kiểm tra đã lưu hoặc thiếu thông tin bắt buộc
    if (
      logicState.current.hasSaved ||
      !logicState.current.startTime ||
      !session?.user?.id ||
      !exerciseId ||
      !categoryId
    ) {
      return;
    }

    const endTime = new Date();
    const startTime = logicState.current.startTime;

    // Convert rep results to match API format (timestamps to ISO strings)
    const formattedRepResults = logicState.current.repResults.map((rep) => ({
      ...rep,
      timestamp: rep.timestamp.toISOString(),
    }));

    console.log("💾 Saving workout results...", {
      total_reps: logicState.current.repResults.length,
      exercise_id: exerciseId,
      category_id: categoryId,
      duration:
        Math.round((endTime.getTime() - startTime.getTime()) / 1000) + "s",
    });

    saveWorkout(
      {
        user_id: session.user.id,
        exercise_id: parseInt(exerciseId),
        category_id: parseInt(categoryId),
        started_at: startTime.toISOString(),
        ended_at: endTime.toISOString(),
        total_reps: logicState.current.repResults.length,
        rep_results: formattedRepResults,
      },
      {
        onSuccess: (data) => {
          console.log("✅ Workout result saved successfully!", data);
          logicState.current.hasSaved = true;
        },
        onError: (error) => {
          console.error("❌ Failed to save workout result:", error);
        },
      }
    );
  }, [session, exerciseId, categoryId, saveWorkout]);

  // Auto-save when all checkpoints finished
  useEffect(() => {
    if (logicState.current.isFinished && !logicState.current.hasSaved) {
      saveWorkoutResults();
    }
  }, [uiState.finished, saveWorkoutResults]);

  // Save when user stops workout (active becomes false)
  useEffect(() => {
    return () => {
      // Cleanup: save results when component unmounts or active becomes false
      // Lưu ngay cả khi không có rep nào hoàn thành, miễn là đã bắt đầu (có startTime)
      if (
        !active &&
        logicState.current.startTime &&
        !logicState.current.hasSaved
      ) {
        saveWorkoutResults();
      }
    };
  }, [active, saveWorkoutResults]);

  // =========================================
  // 4. MEDIAPIPE SETUP
  // =========================================
  useEffect(() => {
    if (!active) return;

    // Set start time when camera becomes active
    if (!logicState.current.startTime) {
      logicState.current.startTime = new Date();
    }

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
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

  // Reset state when active changes
  useEffect(() => {
    if (active) {
      logicState.current = {
        poseIndex: 0,
        holdCounter: 0,
        isFinished: false,
        startTime: new Date(),
        repResults: [],
        hasSaved: false,
      };
    }
  }, [active]);

  // =========================================
  // 5. RENDER
  // =========================================
  if (!active) {
    return (
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-6xl mb-4">📹</div>
          <p className="text-lg">Nhấn "Bắt đầu" để khởi động camera</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col xl:flex-row gap-4 items-stretch justify-center">
      {/* Ảnh mẫu */}
      <div className="flex-1 flex items-center justify-center min-w-[220px] max-w-xs">
        <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden shadow-xl border-2 border-blue-500/30">
          {(() => {
            const imageUrl = getCheckpointImage(uiState.poseName);
            return imageUrl ? (
              <img
                src={imageUrl}
                alt={`Động tác ${uiState.poseName}`}
                className="w-full h-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-[320px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div>Không có ảnh mẫu</div>
                  <div className="text-xs mt-2">({uiState.poseName})</div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Main Video Canvas */}
      <div className="flex-1 flex items-center justify-center min-w-[320px]">
        <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-xl" style={{ minHeight: '500px', maxWidth: 640 }}>
          <video ref={videoRef} className="hidden" muted playsInline />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-full object-contain"
          />

          {/* UI Overlay */}
          <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/70 to-transparent text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-yellow-400 uppercase">
                  {uiState.poseName}
                </h3>
                <p className="text-sm text-gray-300">Bài tập: {uiState.progress}</p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold">
                  {uiState.score.toFixed(0)}{" "}
                  <span className="text-sm font-normal text-gray-400">/ 100</span>
                </div>
                {uiState.finished ? (
                  <span className="text-green-400 font-bold animate-pulse">
                    HOÀN THÀNH! 🎉
                  </span>
                ) : uiState.isGoodPose ? (
                  <span className="text-green-400 font-bold">GIỮ NGUYÊN...</span>
                ) : (
                  <span className="text-red-400">Điều chỉnh tư thế</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reference Angles Comparison Table */}
      <div className="flex-1 flex items-center justify-center min-w-[220px] max-w-xs">
        <div className="bg-gray-900 rounded-lg p-3 text-white shadow-xl max-h-[500px] overflow-y-auto w-full">
          <h4 className="text-sm font-bold text-yellow-400 mb-3 text-center sticky top-0 bg-gray-900 pb-2">
            SO SÁNH GÓC KHỚP
          </h4>
          <div className="space-y-2 text-xs">
            {Object.entries(uiState.targetAngles).map(([joint, targetAngle]) => {
              const userAngle = uiState.userAngles[joint] || 0;
              const diff = Math.abs(userAngle - targetAngle);
              const isGood = diff < 15;

              return (
                <div
                  key={joint}
                  className={`p-2 rounded ${
                    isGood ? "bg-green-900/30" : "bg-red-900/30"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold capitalize">
                      {joint.replace("_", " ")}
                    </span>
                    <span
                      className={`font-bold ${
                        isGood ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isGood ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-400">Mẫu</div>
                      <div className="font-bold text-blue-400">
                        {Math.round(targetAngle)}°
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Bạn</div>
                      <div className="font-bold text-yellow-400">
                        {Math.round(userAngle)}°
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Lệch</div>
                      <div
                        className={`font-bold ${
                          isGood ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {Math.round(diff)}°
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
