import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/authOptions"; // keep your shared config

export default NextAuth(authOptions);
