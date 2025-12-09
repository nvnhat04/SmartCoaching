import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { callAIProvider, getDefaultProvider, type ChatMessage } from "@/lib/ai-providers";

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

    // Xác định AI provider từ environment
    const provider = getDefaultProvider();
    const providerApiKey = provider === "groq" ? process.env.GROQ_API_KEY : process.env.GEMINI_API_KEY;

    if (!providerApiKey) {
      return NextResponse.json(
        {
          error: `${provider.toUpperCase()} API key not configured. Please set ${provider.toUpperCase()}_API_KEY in .env.local`,
          errorType: "missing_api_key",
          success: false,
        },
        { status: 500 }
      );
    }

    // Xây dựng conversation history
    const messages: ChatMessage[] = [];

    // Thêm system prompt và user context
    messages.push({
      role: "system",
      content: SYSTEM_PROMPT + "\n\n" + userContext,
    });

    // Thêm response từ model (giả lập) - chỉ cho lần đầu
    if (conversationHistory.length === 0) {
      messages.push({
        role: "assistant",
        content: "Xin chào! Tôi là AI Fitness Coach của bạn. Tôi đã nắm được thông tin của bạn. Bạn muốn hỏi gì về sức khỏe và luyện tập?",
      });
    }

    // Thêm lịch sử chat (giới hạn 10 tin nhắn gần nhất)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    }

    // Thêm tin nhắn hiện tại
    messages.push({
      role: "user",
      content: message,
    });

    // Gọi AI provider
    const defaultModel = process.env.AI_MODEL || (
      provider === "gemini"
        ? "gemini-1.5-flash"
        : "llama-3.1-70b-versatile"
    );
    
    console.log(`Calling ${provider} API with model: ${defaultModel}`);
    
    const aiResult = await callAIProvider(messages, {
      provider,
      apiKey: providerApiKey,
      model: defaultModel,
    });
    
    console.log(`AI Provider Response:`, {
      hasContent: !!aiResult.content,
      contentLength: aiResult.content?.length || 0,
      hasError: !!aiResult.error,
      error: aiResult.error,
    });

    if (aiResult.error) {
      // Kiểm tra lỗi quota/rate limit
      if (
        aiResult.error.includes("quota") || 
        aiResult.error.includes("exceeded") ||
        aiResult.error.includes("rate limit")
      ) {
        return NextResponse.json(
          {
            error: provider === "gemini"
              ? "Đã vượt quá giới hạn sử dụng Gemini API. Vui lòng kiểm tra quota hoặc chuyển sang Groq."
              : "Đã vượt quá giới hạn sử dụng Groq API. Vui lòng đợi reset quota hoặc chuyển sang Gemini.",
            errorType: "quota_exceeded",
            success: false,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: aiResult.error || "Đã xảy ra lỗi khi gọi AI provider",
          success: false,
        },
        { status: 500 }
      );
    }

    const aiResponse = aiResult.content || 
      "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại.";

    return NextResponse.json({
      response: aiResponse,
      success: true,
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    // Kiểm tra lại lỗi quota trong catch block
    const errorMessage = error.message || "";
    if (errorMessage.includes("quota") || errorMessage.includes("exceeded")) {
      return NextResponse.json(
        {
          error: "Đã vượt quá giới hạn sử dụng AI provider. Vui lòng thử lại sau hoặc chuyển sang provider khác.",
          errorType: "quota_exceeded",
          success: false,
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      {
        error: error.message || "Đã xảy ra lỗi khi xử lý tin nhắn",
        success: false,
      },
      { status: 500 }
    );
  }
}