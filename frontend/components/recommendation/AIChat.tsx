"use client";

import { useState } from "react";

interface AIChatProps {
  onPlanGenerated: () => void;
}

export function AIChat({ onPlanGenerated }: AIChatProps) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Chat với AI Coach
      </h3>
      <div className="h-96 border border-gray-200 rounded-lg p-4 mb-4 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Xin chào! Tôi có thể giúp gì cho bạn?
          </p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.role === "user" ? "text-right" : ""}`}>
              <div
                className={`inline-block px-4 py-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Gửi
        </button>
      </div>
    </div>
  );
}
