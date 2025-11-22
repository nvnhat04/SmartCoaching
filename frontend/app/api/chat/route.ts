import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Sử dụng gemini-2.5-flash - stable, nhanh, phù hợp cho chat
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

// System prompt cho AI fitness coach
const SYSTEM_PROMPT = `Bạn là một AI Fitness Coach chuyên nghiệp, thân thiện và nói chuyện tự nhiên như huấn luyện viên cá nhân.  
Nhiệm vụ của bạn là **đánh giá thể trạng người dùng dựa trên các chỉ số được cung cấp (tuổi, giới tính, chiều cao, cân nặng, BMI, chỉ số mỡ, v.v.)**  
và **đưa ra nhận xét ngắn gọn, trực tiếp và thực tế.**

Hướng dẫn phong cách trả lời:
- Viết **ngắn gọn, đi thẳng vào nhận xét chính** (2–4 câu là đủ).
- **Không nhắc lại dữ liệu người dùng đã nói**.
- **Không mở đầu bằng lời chào hay giới thiệu** trừ khi người dùng mới bắt đầu hội thoại.
- **Tập trung vào phân tích, nhận xét, và gợi ý hành động cụ thể.**
- Nếu thiếu dữ liệu để đánh giá chính xác, **hỏi thêm thông tin cụ thể và ngắn gọn**.
- Khi đưa lời khuyên, **ưu tiên an toàn và tính cá nhân hóa.**
- **Không cần trình bày theo dạng danh sách hoặc tiêu đề** trừ khi người dùng yêu cầu.

Lưu ý:  
Bạn chỉ tư vấn về thể dục và dinh dưỡng cơ bản, không chẩn đoán y tế.`;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Lấy thông tin user từ database (nếu có)
    await connectDB();
    const user = await User.findById(session.user.id);

    // Hardcode data cho testing (sẽ thay thế bằng data từ DB sau)
    // Hoặc dùng data từ User model nếu có
    const userAge = user?.age || 21; // Hardcode: 21 tuổi
    const userHeight = user?.height || 175; // Hardcode: 175 cm
    const userWeight = user?.weight || 75; // Hardcode: 75 kg
    const userGender = user?.gender || "male";
    
    // Tính BMI từ weight và height
    let bmi: number | null = null;
    if (userWeight && userHeight) {
      const heightInMeters = userHeight / 100;
      bmi = Number((userWeight / (heightInMeters * heightInMeters)).toFixed(1));
    } else if (user?.bmi) {
      // Nếu có BMI sẵn trong DB thì dùng
      bmi = user.bmi;
    }

    // Tạo context từ thông tin user
    const userContext = `
Thông tin người dùng:
- Tên: ${user?.name || "Chưa cập nhật"}
- Tuổi: ${userAge} tuổi
- Giới tính: ${user?.gender === "male" ? "Nam" : user?.gender === "female" ? "Nữ" : "Chưa cập nhật"}
- Chiều cao: ${userHeight} cm
- Cân nặng: ${userWeight} kg
- BMI: ${bmi || "Chưa tính được"}
- Giới tính: ${userGender}
`;

    // Xây dựng conversation history
    // Format cho Gemini API
    const contents: any[] = [];

    // Thêm system prompt và user context vào tin nhắn đầu tiên
    contents.push({
      role: "user",
      parts: [{ text: SYSTEM_PROMPT + "\n\n" + userContext }],
    });

    // Thêm response từ model (giả lập)
    contents.push({
      role: "model",
      parts: [{ text: "Xin chào! Tôi là AI Fitness Coach của bạn. Tôi đã nắm được thông tin của bạn. Bạn muốn hỏi gì về sức khỏe và luyện tập?" }],
    });

    // Thêm lịch sử chat (giới hạn 10 tin nhắn gần nhất)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }

    // Thêm tin nhắn hiện tại
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Gọi Gemini API
    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      throw new Error(errorData.error?.message || "Failed to get response from Gemini API");
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại.";

    return NextResponse.json({
      response: aiResponse,
      success: true,
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Đã xảy ra lỗi khi xử lý tin nhắn",
        success: false,
      },
      { status: 500 }
    );
  }
}