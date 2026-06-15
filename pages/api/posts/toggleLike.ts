import { withApiAuth, withToggleLike } from '../../../app/lib/apiHandler'

export default withApiAuth({
  method: 'POST',
  requireAuth: true,
  handler: withToggleLike({ relation: 'postId', idParamName: 'postId' }),
})