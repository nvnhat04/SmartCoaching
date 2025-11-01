const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export interface PoseDetectionRequest {
  imageData: string; // base64 encoded image
  exerciseType: string;
}

export interface PoseDetectionResponse {
  success: boolean;
  score: number;
  feedback: string;
  status: "correct" | "warning" | "error";
  keypoints: any[];
  angles?: Record<string, number>;
  repCount?: number;
}

export class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = AI_SERVICE_URL;
  }

  async detectPose(data: PoseDetectionRequest): Promise<PoseDetectionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pose/detect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to detect pose");
      }

      return await response.json();
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  }

  async getRecommendations(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/recommendations/${userId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to get recommendations");
      }

      return await response.json();
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  }

  async generateWorkoutPlan(userProfile: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plan/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userProfile),
      });

      if (!response.ok) {
        throw new Error("Failed to generate workout plan");
      }

      return await response.json();
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  }

  async chatWithAI(message: string, context: any): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, context }),
      });

      if (!response.ok) {
        throw new Error("Failed to chat with AI");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  }
}

export const aiService = new AIService();
