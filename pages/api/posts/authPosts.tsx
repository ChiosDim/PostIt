import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../app/lib/authOptions";
import prisma from "../../../prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ error: "Please sign in to make a post" });
    }
    //Get Auth Users Posts
    try {
      const data = await prisma.user.findUnique({
        where: {
          email: session.user?.email,
        },
        include: {
          posts: {
            orderBy: { createdAt: "desc" },
            include: { comments: true },
          },
        },
      });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: "Error fetching auth posts" });
    }
  }
}
