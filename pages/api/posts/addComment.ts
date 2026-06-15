import { withApiAuth } from '../../../app/lib/apiHandler'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'

export default withApiAuth({
  method: 'POST',
  requireAuth: true,
  handler: async (req, res, session, user) => {
    const { postId, message } = req.body as { postId?: string; message?: string }
    const msg = (message ?? '').trim()
    if (!postId) return res.status(400).json({ error: 'Missing postId' })
    if (!msg)
      return res.status(400).json({ error: 'Please do not leave this empty' })
    if (msg.length > 300)
      return res.status(400).json({ error: 'Please write a shorter comment' })

    // Get User (already have user from wrapper)
    try {
      const created = await prisma.comment.create({
        data: { postId, userId: user!.id, message: msg },
        include: { user: { select: { id: true, name: true, image: true } } },
      })

      // make dates serializable if needed
      return res.status(201).json({
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      })
    } catch (err) {
      console.error('Error adding comment:', err)
      return res.status(403).json({ error: 'Error adding comment' })
    }
  },
})