import { withApiAuth } from '../../../app/lib/apiHandler'
import prisma from '../../../prisma/client'

export default withApiAuth({
  method: 'POST',
  requireAuth: true,
  handler: async (req, res, session, _user) => {
    console.log('POST /api/posts/addPost - body:', req.body)

    try {
      // user is guaranteed non-null, email from session
      const email = session?.user?.email ?? ''
      const title: string = String(req.body?.title ?? '')
      if (!title.trim()) {
        return res.status(400).json({ error: 'Please do not leave this empty' })
      }
      if (title.length > 300) {
        return res.status(400).json({ error: 'Please write a shorter post' })
      }

      const prismaUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })

      if (!prismaUser) {
        console.error('No user found for email', email)
        return res.status(404).json({ error: 'User not found' })
      }

      const result = await prisma.post.create({
        data: {
          title,
          userId: prismaUser.id,
        },
      })

      console.log('Post created:', result)
      return res.status(201).json(result)
    } catch (err) {
      console.error('Error creating post:', err)
      return res.status(500).json({ error: 'Error creating post' })
    }
  },
})