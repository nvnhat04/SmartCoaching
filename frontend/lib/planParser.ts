/**
 * Parse workout plan from AI response (markdown format)
 * 
 * Expected format:
 * ## LỘ TRÌNH TẬP LUYỆN
 * 
 * **Tuần 1-2: Khởi động**
 * - Ngày 1: Squat, 3 sets × 15 reps
 * - Ngày 2: Push-up, 3 sets × 10 reps
 * ...
 */

export interface PlanDay {
  day: number;
  title: string;
  exercises: string[];
  details?: string;
}

export interface ParsedPlan {
  title: string;
  description?: string;
  days: PlanDay[];
  rawContent: string;
}

export function parseWorkoutPlan(response: string): ParsedPlan | null {
  // Kiểm tra xem có phải là kế hoạch không
  const hasPlanKeywords = 
    response.toLowerCase().includes("kế hoạch") ||
    response.toLowerCase().includes("lộ trình") ||
    response.toLowerCase().includes("tuần") ||
    response.toLowerCase().includes("ngày");

  if (!hasPlanKeywords) {
    return null;
  }

  const lines = response.split("\n");
  const plan: ParsedPlan = {
    title: "Kế hoạch tập luyện",
    days: [],
    rawContent: response,
  };

  let currentDay: PlanDay | null = null;
  let inPlanSection = false;
  let dayCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Bỏ qua dòng trống
    if (!line) continue;

    // Tìm tiêu đề kế hoạch
    const headerMatch = line.match(/^##+\s*(.+)$/);
    if (headerMatch) {
      const headerText = headerMatch[1].trim();
      if (
        headerText.toLowerCase().includes("kế hoạch") ||
        headerText.toLowerCase().includes("lộ trình") ||
        headerText.toLowerCase().includes("tập luyện")
      ) {
        plan.title = headerText;
        inPlanSection = true;
        continue;
      }
    }

    // Nếu đã vào phần kế hoạch
    if (inPlanSection || hasPlanKeywords) {
      // Tìm tuần hoặc ngày
      const weekMatch = line.match(/\*\*(.+?tuần.+?)\*\*/i);
      const dayMatch = line.match(/(?:ngày|day)\s*(\d+)[:：]\s*(.+)/i);
      const dayMatch2 = line.match(/^[-*]\s*(?:ngày|day)\s*(\d+)[:：]\s*(.+)/i);
      const dayMatch3 = line.match(/^(\d+)\.\s*(?:ngày|day)\s*(\d+)[:：]\s*(.+)/i);

      if (weekMatch) {
        // Lưu tuần trước đó nếu có
        if (currentDay) {
          plan.days.push(currentDay);
          currentDay = null;
        }
        // Tạo section mới cho tuần
        plan.description = weekMatch[1];
      } else if (dayMatch || dayMatch2 || dayMatch3) {
        // Lưu ngày trước đó nếu có
        if (currentDay) {
          plan.days.push(currentDay);
        }

        const match = dayMatch || dayMatch2 || dayMatch3;
        const dayNum = match![1] || match![2];
        const dayContent = match![2] || match![3];

        dayCounter++;
        currentDay = {
          day: parseInt(dayNum) || dayCounter,
          title: dayContent.trim(),
          exercises: [],
        };
      } else if (currentDay) {
        // Thêm exercise vào ngày hiện tại
        const exerciseMatch = line.match(/^[-*]\s*(.+)/);
        if (exerciseMatch) {
          const exerciseText = exerciseMatch[1].trim();
          // Parse exercise details (sets, reps, etc.)
          const detailsMatch = exerciseText.match(/(.+?)(?:,\s*|\s+)(\d+)\s*sets?\s*[×x]\s*(\d+)\s*reps?/i);
          if (detailsMatch) {
            const exerciseName = detailsMatch[1].trim();
            const sets = detailsMatch[2];
            const reps = detailsMatch[3];
            currentDay.exercises.push(`${exerciseName} - ${sets} sets × ${reps} reps`);
          } else {
            currentDay.exercises.push(exerciseText);
          }
        } else {
          // Nếu không phải list item, có thể là mô tả
          if (!currentDay.details) {
            currentDay.details = line;
          } else {
            currentDay.details += " " + line;
          }
        }
      } else if (!plan.description && line.length < 100) {
        // Lấy mô tả đầu tiên
        plan.description = line;
      }
    }
  }

  // Lưu ngày cuối cùng
  if (currentDay) {
    plan.days.push(currentDay);
  }

  // Nếu không parse được ngày nào, thử parse đơn giản hơn
  if (plan.days.length === 0) {
    // Tìm tất cả các dòng có "ngày" hoặc "day"
    const dayLines = lines.filter((line) =>
      /(?:ngày|day)\s*\d+/i.test(line)
    );

    if (dayLines.length > 0) {
      dayLines.forEach((line, index) => {
        const match = line.match(/(?:ngày|day)\s*(\d+)[:：]?\s*(.+)/i);
        if (match) {
          plan.days.push({
            day: parseInt(match[1]) || index + 1,
            title: match[2].trim(),
            exercises: [],
          });
        }
      });
    }
  }

  // Chỉ trả về plan nếu có ít nhất 1 ngày
  return plan.days.length > 0 ? plan : null;
}

