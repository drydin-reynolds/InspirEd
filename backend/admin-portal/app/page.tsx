import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminTabs from "./admin/component/adminTabs";

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;

  if (!session) redirect("/login");

  return <AdminTabs />;
}
