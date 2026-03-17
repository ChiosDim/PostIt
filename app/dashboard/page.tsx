import { getServerSession } from "next-auth";
import { authOptions } from "../lib/authOptions";
import { redirect } from "next/navigation";
import MyPosts from "./MyPosts";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }
  return (
    <main className="py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
        Welcome back {session?.user?.name}
      </h1>
      <MyPosts />
    </main>
  );
}
