import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ApprenticePostForm from "@/components/ApprenticePostForm";

export const dynamic = "force-dynamic";

export default async function ApprenticeAdminPage() {
  const session = await getSession();

  // Only a logged-in admin can open this form.
  if (!session || session.role !== "admin") {
    redirect("/admin/login?next=%2Fadmin%2Fapprentice");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <ApprenticePostForm />
    </main>
  );
}
