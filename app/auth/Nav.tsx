import Link from "next/link";
import Login from "./Login";
import Logged from "./Logged";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/authOptions";

export default async function Nav() {
  const session = await getServerSession(authOptions);
  return (
    <nav className="flex flex-col sm:flex-row justify-between items-center py-6 sm:py-8 gap-4 sm:gap-0">
      <Link href={"/"}>
        <h1 className="font-bold text-xl sm:text-lg">Send it.</h1>
      </Link>
      <ul className="flex items-center gap-4 sm:gap-6">
        {!session?.user && <Login />}
        {session?.user && <Logged image={session.user?.image || ""} />}
      </ul>
    </nav>
  );
}
