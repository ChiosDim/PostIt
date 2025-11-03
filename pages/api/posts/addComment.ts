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
  //Add a comment
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "Please sign in to make a post" });
  }

  const { postId, message } = req.body as { postId?: string; message?: string };
  const msg = (message ?? "").trim();
  if (!postId) return res.status(400).json({ error: "Missing postId" });
  if (!msg)
    return res.status(400).json({ error: "Please do not leave this empty" });
  if (msg.length > 300)
    return res.status(400).json({ error: "Please write a shorter comment" });

  //Get User
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
    select: { id: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });

  try {
    const { title, postId } = await req.body;

    const created = await prisma.comment.create({
      data: { postId, userId: user.id, message: msg },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    // make dates serializable if needed
    return res.status(201).json({
      ...created,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });
  } catch (err) {
    res.status(403).json({ error: "Error adding comment" });
  }
}
