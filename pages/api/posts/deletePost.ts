import { withApiAuth } from '../../../app/lib/apiHandler'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'

export default withApiAuth({
  method: 'DELETE',
  requireAuth: true,
  handler: async (req, res, session, user) => {
    console.log('DELETE /api/posts/deletePost - body:', req.body)
    try {
      const { id } = req.body

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid id' })
      }

      const result = await prisma.post.delete({
        where: {
          id,
        },
      })

      return res.status(200).json(result)
    } catch (err) {
      console.error('Error deleting post:', err)
      const message =
        err instanceof Error
          ? err.message
          : JSON.stringify(err, Object.getOwnPropertyNames(err))
      return res
        .status(500)
        .json({ error: 'Error deleting post', details: message })
    }
  },
})