import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("POST /api/posts/addPost - body:", req.body);

  try {
    const session = await getServerSession(req, res, authOptions);
    console.log("session:", !!session, session?.user?.email);

    if (!session || !session.user?.email) {
      return res.status(401).json({ error: "Please sign in to make a post" });
    }

    const title: string = String(req.body?.title ?? "");
    if (!title.trim()) {
      return res.status(400).json({ error: "Please do not leave this empty" });
    }
    if (title.length > 300) {
      return res.status(400).json({ error: "Please write a shorter post" });
    }

    const prismaUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!prismaUser) {
      console.error("No user found for email", session.user.email);
      return res.status(404).json({ error: "User not found" });
    }

    const result = await prisma.post.create({
      data: {
        title,
        userId: prismaUser.id,
      },
    });

    console.log("Post created:", result);
    return res.status(201).json(result);
  } catch (err) {
    console.error("Error creating post:", err);
    return res.status(500).json({ error: "Error creating post" });
  }
}
