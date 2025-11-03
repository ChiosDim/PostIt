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
  //Get User
  const prismaUser = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
  });

  try {
    const { title, postId } = await req.body;

    if (!title.length) {
      return res.status(401).json({ error: "Comment cannot be empty" });
    }
    const result = await prisma.comment.create({
      data: {
        message: title,
        postId: postId,
        userId: prismaUser?.id || "",
      },
    });

    return res.status(200).json(result);
  } catch (err) {
    res.status(403).json({ error: "Error adding comment" });
  }
}
