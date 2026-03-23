import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  // In some Next.js 16 contexts, `cookies()` can be async.
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session) redirect("/login");

  // Make the admin portal the front page.
  redirect("/");
}

