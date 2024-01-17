import { UserRow, ConnectionContext } from '@orbiting/backend-modules-types'
import debug from 'debug'

type Args = {
  campaign: string
}

exports = {
  async referrals(user: UserRow, args: Args, ctx: ConnectionContext) {
    const { pgdb } = ctx
    const { campaign: campaignId } = args

    return 2
  },
}
