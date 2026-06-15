import { withApiAuth } from '../../../app/lib/apiHandler'
import prisma from '../../../prisma/client'

export default withApiAuth({
  method: 'PUT',
  requireAuth: true,
  handler: async (req, res, _session, user) => {
    const { id, title } = req.body as { id?: string; title?: string }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid id' })
    }

    const newTitle = (title ?? '').trim()
    if (!newTitle) {
      return res.status(400).json({ error: 'Title cannot be empty' })
    }
    if (newTitle.length > 300) {
      return res.status(400).json({ error: 'Title is too long' })
    }

    // Check if the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    if (post.userId !== user!.id) {
      return res
        .status(403)
        .json({ error: 'You can only edit your own posts' })
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { title: newTitle },
      include: { user: true },
    })

    return res.status(200).json(updatedPost)
  },
})