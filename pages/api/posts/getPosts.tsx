import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = await prisma.post.findMany({
      include: { user: true, comments: true },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(data);
  } catch (err) {
    // improved debug output for Prisma / runtime errors
    console.error("Error fetching posts — full error:", err);
    // safe extraction of message/details
    const message =
      err instanceof Error
        ? err.message
        : JSON.stringify(err, Object.getOwnPropertyNames(err));
    return res
      .status(500)
      .json({ error: "Error fetching posts", details: message });
  }
}
