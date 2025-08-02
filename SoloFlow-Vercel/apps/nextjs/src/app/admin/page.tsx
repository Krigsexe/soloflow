import { auth } from "@soloflow/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  const user = session?.user;

  if (!user?.isAdmin) {
    redirect("/");
  }

  return (
    <div>
      <h1>Admin</h1>
      <p>Welcome, {user?.name}</p>
    </div>
  );
}