"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useExercise } from "@/hooks/useApi";
import { WorkoutSession } from "@/components/practice/WorkoutSession";
// Lấy start và end từ URL
function getStartEnd(url: string) {
  const query = url.split("?")[1];
  if (!query) return { start: 0, end: 99999 };

  const params = new URLSearchParams(query);
  const start = Number(params.get("start") || 0);
  const end = Number(params.get("end") || 99999);

  return { start, end };
}

export default function ExercisePracticePage({
  params,
}: {
  params: { categoryId: string; exerciseId: string };
}) {
  const { data: exercise, isLoading, error } = useExercise(params.exerciseId);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    if (!isCameraActive) return;

    async function startWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    }

    startWebcam();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  useEffect(() => {
    if (!exercise?.videoUrl) return;

    const { start, end } = getStartEnd(exercise.videoUrl);
    let checkInterval: NodeJS.Timeout;

    // Load YouTube API nếu chưa có
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    // Đợi YT API load xong
    const waitYT = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        clearInterval(waitYT);

        playerRef.current = new (window as any).YT.Player("demo-video-player", {
          events: {
            onReady: () => {
              playerRef.current.seekTo(start);
              playerRef.current.playVideo();
            },
            onStateChange: (event: any) => {
              // Chỉ check khi đang phát
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                checkInterval = setInterval(() => {
                  if (!playerRef.current) {
                    clearInterval(checkInterval);
                    return;
                  }

                  const t = playerRef.current.getCurrentTime();

                  // Nếu tua ra ngoài phạm vi thì kéo về
                  if (t < start) {
                    playerRef.current.seekTo(start);
                  } else if (t > end) {
                    // Chỉ khi thực sự vượt quá end mới dừng
                    playerRef.current.pauseVideo();
                    playerRef.current.seekTo(start);
                    clearInterval(checkInterval);
                  }
                }, 100);
              } else {
                // Dừng check khi không phát
                if (checkInterval) clearInterval(checkInterval);
              }
            },
          },
        });
      }
    }, 300);

    return () => {
      clearInterval(waitYT);
      if (checkInterval) clearInterval(checkInterval);
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [exercise?.videoUrl]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="space-y-6">
        <Link
          href={`/category/${params.categoryId}`}
          className="text-gray-600 hover:text-gray-900 transition-colors inline-block"
        >
          ← Quay lại
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">⚠️ Không tìm thấy bài tập</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center flex justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/category/${params.categoryId}`}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Quay lại
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{exercise.name}</h1>
        </div>
        <button
          onClick={() => setIsCameraActive(!isCameraActive)}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isCameraActive
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {/* {isCameraActive ? "🛑 Dừng camera" : "📹 Bật camera"} */}
        </button>
      </div>

      {/* Exercise Info */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-4 text-sm text-gray-600">
          <span>⏱️ {exercise.duration}</span>
          <span>•</span>
          <span>🔄 {exercise.reps}</span>
          <span>•</span>
          <span
            className={`px-3 py-1 rounded-full ${
              exercise.difficulty === "Easy"
                ? "bg-green-100 text-green-700"
                : exercise.difficulty === "Medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {exercise.difficulty}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video mẫu - Bên trái */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🎥 Video hướng dẫn
          </h2>
          <div className="relative pt-[56.25%] bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              id="demo-video-player"
              src={`${exercise.videoUrl}&autoplay=1&controls=1&modestbranding=1&rel=0&enablejsapi=1&loop=1`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <WorkoutSession
          exercise={""}
          onEnd={() => {
            setSessionStarted(false);
            setSelectedExercise(null);
          }}
        />
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 Mẹo tập luyện hiệu quả
        </h3>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          <li>Xem kỹ video mẫu để hiểu động tác chuẩn</li>
          <li>Bật camera để tự quan sát và điều chỉnh tư thế</li>
          <li>Tập chậm trước, nhanh sau khi đã quen động tác</li>
          <li>Nghỉ ngơi hợp lý giữa các hiệp tập</li>
        </ul>
      </div>
    </div>
  );
}
