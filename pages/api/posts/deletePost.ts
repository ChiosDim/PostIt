import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../app/lib/authOptions";
import prisma from "../../../prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "Please sign in to make a post" });
  }

  try {
    console.log("DELETE /api/posts/deletePost - body:", req.body);
    const { id } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing or invalid id" });
    }

    const result = await prisma.post.delete({
      where: {
        id,
      },
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error deleting post:", err);
    const message =
      err instanceof Error
        ? err.message
        : JSON.stringify(err, Object.getOwnPropertyNames(err));
    return res
      .status(500)
      .json({ error: "Error deleting post", details: message });
  }
}
