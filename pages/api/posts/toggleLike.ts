import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../app/lib/authOptions";
import prisma from "../../../prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "Please sign in to like a post" });
  }

  const { postId } = req.body as { postId?: string };

  if (!postId) {
    return res.status(400).json({ error: "Missing postId" });
  }

  // Get User
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email },
    select: { id: true },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    });

    if (existingLike) {
      // Unlike - delete the like
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      return res.status(200).json({ liked: false });
    } else {
      // Like - create a new like
      await prisma.like.create({
        data: {
          userId: user.id,
          postId: postId,
        },
      });
      return res.status(200).json({ liked: true });
    }
  } catch (err) {
    console.error("Error toggling like:", err);
    return res.status(500).json({ error: "Error toggling like" });
  }
}
