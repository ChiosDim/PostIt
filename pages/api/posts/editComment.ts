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
    return res.status(401).json({ error: "Please sign in to edit a comment" });
  }

  const { id, message } = req.body as { id?: string; message?: string };

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid id" });
  }

  const newMessage = (message ?? "").trim();
  if (!newMessage) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }
  if (newMessage.length > 300) {
    return res.status(400).json({ error: "Message is too long" });
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
    // Check if the comment exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.userId !== user.id) {
      return res
        .status(403)
        .json({ error: "You can only edit your own comments" });
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { message: newMessage },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return res.status(200).json({
      ...updatedComment,
      createdAt: updatedComment.createdAt.toISOString(),
      updatedAt: updatedComment.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error("Error editing comment:", err);
    return res.status(500).json({ error: "Error editing comment" });
  }
}
