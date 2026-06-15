import { withApiAuth } from '../../../app/lib/apiHandler'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'

export default withApiAuth({
  method: 'GET',
  requireAuth: false,
  handler: async (req, res, session, user) => {
    // user will be null if requireAuth false and no session, or if session missing email.
    // But we still have session object to check email.
    if (!session || !session.user?.email) {
      return res.status(200).json({ user: null })
    }

    try {
      const userData = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, name: true, image: true, email: true },
      })

      return res.status(200).json({ user: userData })
    } catch (err) {
      console.error('Error fetching current user:', err)
      return res.status(500).json({ error: 'Error fetching current user' })
    }
  },
})