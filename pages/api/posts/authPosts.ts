import { withApiAuth } from '../../../app/lib/apiHandler'
import prisma from '../../../prisma/client'

export default withApiAuth({
  method: 'GET',
  requireAuth: true,
  handler: async (_req, res, session, _user) => {
    //Get Auth Users Posts
    try {
      const data = await prisma.user.findUnique({
        where: {
          email: session?.user?.email ?? '',
        },
        include: {
          posts: {
            orderBy: { createdAt: 'desc' },
            include: { comments: true, likes: true },
          },
        },
      })
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ error: 'Error fetching auth posts' })
    }
  },
})