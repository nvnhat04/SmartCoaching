import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { BodyMetrics } from "@/components/profile/BodyMetrics";
import { GoalsSetting } from "@/components/profile/GoalsSetting";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Hồ sơ cá nhân 👤
        </h1>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin và mục tiêu tập luyện của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProfileForm user={session?.user} />
        </div>
        <div className="space-y-6">
          <BodyMetrics />
          <GoalsSetting />
        </div>
      </div>
    </div>
  );
}
