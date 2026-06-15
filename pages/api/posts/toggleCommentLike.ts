import { withApiAuth } from '../../../app/lib/apiHandler'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'

export default withApiAuth({
  method: 'POST',
  requireAuth: true,
  handler: async (req, res, session, user) => {
    const { commentId } = req.body as { commentId?: string }

    if (!commentId) {
      return res.status(400).json({ error: 'Missing commentId' })
    }

    try {
      // Check if already liked
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_commentId: {
            userId: user!.id,
            commentId: commentId,
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
            commentId: commentId,
          },
        })
        return res.status(200).json({ liked: true })
      }
    } catch (err) {
      console.error('Error toggling comment like:', err)
      return res.status(500).json({ error: 'Error toggling comment like' })
    }
  },
})