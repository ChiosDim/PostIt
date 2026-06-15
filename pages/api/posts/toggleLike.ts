import { withApiAuth } from '../../../app/lib/apiHandler'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'

export default withApiAuth({
  method: 'POST',
  requireAuth: true,
  handler: async (req, res, session, user) => {
    const { postId } = req.body as { postId?: string }

    if (!postId) {
      return res.status(400).json({ error: 'Missing postId' })
    }

    try {
      // Check if already liked
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: user!.id,
            postId: postId,
          },
        },
      })

      if (existingLike) {
        // Unlike - delete the like
        await prisma.like.delete({
          where: {
            id: existingLike.id,
          },
        })
        return res.status(200).json({ liked: false })
      } else {
        // Like - create a new like
        await prisma.like.create({
          data: {
            userId: user!.id,
            postId: postId,
          },
        })
        return res.status(200).json({ liked: true })
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      return res.status(500).json({ error: 'Error toggling like' })
    }
  },
})