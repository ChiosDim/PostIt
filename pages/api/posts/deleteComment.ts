import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../app/lib/authOptions";
import prisma from "../../../prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res
      .status(401)
      .json({ error: "Please sign in to delete a comment" });
  }

  const { id } = req.body as { id?: string };

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid id" });
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
        .json({ error: "You can only delete your own comments" });
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error deleting comment:", err);
    return res.status(500).json({ error: "Error deleting comment" });
  }
}
