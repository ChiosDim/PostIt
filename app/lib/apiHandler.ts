import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './authOptions'
import type { Session, NextAuthOptions } from 'next-auth'
import prisma from '../../prisma/client'

interface ApiHandlerOptions {
  method: string
  requireAuth?: boolean
  onUnauthenticated?: (res: NextApiResponse) => void
  // handler receives req, res, session (may be null), user (may be null if requireAuth false or session missing)
  handler: (req: NextApiRequest, res: NextApiResponse, session: Session | null, user: { id: string } | null) => Promise<void>
}

export function withApiAuth(options: ApiHandlerOptions) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Method check
    if (req.method !== options.method) {
      res.setHeader('Allow', options.method)
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const session = await getServerSession(req, res, authOptions)
    const userEmail = session?.user?.email ?? null

    let user = null
    if (userEmail) {
      try {
        user = await prisma.user.findUnique({
          where: { email: userEmail },
          select: { id: true },
        })
      } catch (err) {
        console.error('Error fetching user:', err)
        return res.status(500).json({ error: 'Internal server error' })
      }
    }

    // If authentication required but missing
    if (options.requireAuth && (!session || !userEmail || !user)) {
      if (options.onUnauthenticated) {
        return options.onUnauthenticated(res)
      }
      // Default unauthorized message
      return res.status(401).json({ error: 'Please sign in to perform this action' })
    }

    try {
      await options.handler(req, res, session, user ?? null)
    } catch (err) {
      console.error('API handler error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}