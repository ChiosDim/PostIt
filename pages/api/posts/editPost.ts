import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../app/lib/authOptions";
import prisma from "../../../prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "Please sign in to edit a post" });
  }

  const { id, title } = req.body as { id?: string; title?: string };

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid id" });
  }

  const newTitle = (title ?? "").trim();
  if (!newTitle) {
    return res.status(400).json({ error: "Title cannot be empty" });
  }
  if (newTitle.length > 300) {
    return res.status(400).json({ error: "Title is too long" });
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
    // Check if the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId !== user.id) {
      return res
        .status(403)
        .json({ error: "You can only edit your own posts" });
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { title: newTitle },
      include: { user: true },
    });

    return res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error editing post:", err);
    return res.status(500).json({ error: "Error editing post" });
  }
}
