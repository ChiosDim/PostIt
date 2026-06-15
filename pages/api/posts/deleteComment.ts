import { withApiAuth } from '../../../app/lib/apiHandler'
import prisma from '../../../prisma/client'

export default withApiAuth({
  method: 'DELETE',
  requireAuth: true,
  handler: async (_req, res, _session, user) => {
    // user is guaranteed non-null because requireAuth true and we passed validation
    const { id } = _req.body as { id?: string }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid id' })
    }

    // Check if the comment exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    if (comment.userId !== user!.id) {
      return res
        .status(403)
        .json({ error: 'You can only delete your own comments' })
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id },
    })

    return res.status(200).json({ success: true })
  },
})