import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './authOptions'
import type { Session, NextAuthOptions } from 'next-auth'
import prisma from '../../prisma/client'
import type { Prisma } from '@prisma/client'

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

export function withToggleLike(options: { relation: 'postId' | 'commentId'; idParamName: string }) {
  return async (req: NextApiRequest, res: NextApiResponse, session: Session | null, user: { id: string } | null) => {
    // Note: We assume the method and auth have been validated by the outer withApiAuth wrapper.
    // So we don't check method or session/user here.

    const id = req.body[options.idParamName] as string | undefined
    if (!id) {
      return res.status(400).json({ error: `Missing ${options.idParamName}` })
    }

    try {
      // Check if already liked
      let where: Prisma.LikeWhereUniqueInput
      if (options.relation === 'postId') {
        where = { userId_postId: { userId: user!.id, postId: id } }
      } else {
        where = { userId_commentId: { userId: user!.id, commentId: id } }
      }

      const existingLike = await prisma.like.findUnique({
        where,
      })

      if (existingLike) {
        await prisma.like.delete({ where: { id: existingLike.id } })
        return res.status(200).json({ liked: false })
      } else {
        await prisma.like.create({
          data: {
            userId: user!.id,
            [options.relation]: id,
          },
        })
        return res.status(200).json({ liked: true })
      }
    } catch (err) {
      console.error(`Error toggling ${options.relation} like:`, err)
      return res.status(500).json({ error: `Error toggling ${options.relation} like` })
    }
  }
}