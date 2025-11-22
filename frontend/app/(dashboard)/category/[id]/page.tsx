"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useCategory, useExercises } from "@/hooks/useApi";

const difficultyColors = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

// Lấy start và end từ URL
function getStartEnd(url: string) {
  const query = url.split("?")[1];
  if (!query) return { start: 0, end: 99999 };

  const params = new URLSearchParams(query);
  const start = Number(params.get("start") || 0);
  const end = Number(params.get("end") || 99999);

  return { start, end };
}

export default function CategoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useCategory(params.id);

  const {
    data: exercises,
    isLoading: exercisesLoading,
    error: exercisesError,
  } = useExercises(params.id);

  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    null
  );

  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!selectedVideo) return;

    const { start, end } = getStartEnd(selectedVideo);
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

        playerRef.current = new (window as any).YT.Player(
          "custom-video-player",
          {
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
          }
        );
      }
    }, 300);

    return () => {
      clearInterval(waitYT);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [selectedVideo]);

  // ==========================================================================

  const isLoading = categoryLoading || exercisesLoading;
  const error = categoryError || exercisesError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="space-y-6">
        <Link
          href="/category"
          className="text-gray-600 hover:text-gray-900 transition-colors inline-block"
        >
          ← Quay lại
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-2">
            ⚠️ Lỗi: {error ? (error as Error).message : "Category not found"}
          </p>
          <p className="text-sm text-gray-600">
            Vui lòng kiểm tra backend đang chạy và có dữ liệu trong MongoDB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 flex-col"
          onClick={() => {
            setSelectedVideo(null);
            playerRef.current = null;
          }}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setSelectedVideo(null);
                playerRef.current = null;
              }}
              className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-colors"
            >
              ✕
            </button>

            <div className="relative pt-[56.25%]">
              <iframe
                id="custom-video-player"
                src={`${selectedVideo}&autoplay=1&controls=1&modestbranding=1&rel=0&enablejsapi=1&loop=1`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Nút tập luyện */}
          <Link
            href={`/practice/${params.id}/${selectedExerciseId}`}
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Tập luyện →
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/category"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Quay lại
        </Link>
      </div>

      {/* Category Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category.name}
            </h1>
            <p className="text-gray-600 mb-3">{category.description}</p>
            <div className="flex gap-3">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                {category.category}
              </span>
              <span
                className={`inline-block px-3 py-1 text-sm rounded-full ${
                  difficultyColors[
                    category.difficulty as keyof typeof difficultyColors
                  ]
                }`}
              >
                {category.difficulty}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Danh sách bài tập ({exercises?.length || 0})
        </h2>

        {!exercises || exercises.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-700">
              Chưa có bài tập nào cho danh mục này.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div
                    className="relative flex-shrink-0 w-48 h-32 cursor-pointer group"
                    onClick={() => {
                      setSelectedVideo(exercise.videoUrl);
                      setSelectedExerciseId(exercise.id);
                    }}
                  >
                    <Image
                      src={exercise.thumbnail}
                      alt={exercise.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                        <svg
                          className="w-6 h-6 text-white ml-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Exercise Info */}
                  <div className="flex-1 p-4 flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {exercise.name}
                      </h3>
                      <div className="flex gap-3 text-sm text-gray-600">
                        <span>⏱️ {exercise.duration}</span>
                        <span>•</span>
                        <span>🔄 {exercise.reps}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        difficultyColors[
                          exercise.difficulty as keyof typeof difficultyColors
                        ]
                      }`}
                    >
                      {exercise.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start All */}
      <div className="flex justify-center pt-4">
        <Link
          href={`/practice/${params.id}`}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Bắt đầu tất cả bài tập →
        </Link>
      </div>
    </div>
  );
}
