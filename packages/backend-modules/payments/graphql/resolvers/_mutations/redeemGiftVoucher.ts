import { GraphqlContext } from '@orbiting/backend-modules-types'
import { GiftShop } from '../../../lib/shop/gifts'
// import { Payments } from '../../../lib/payments'
import { default as Auth } from '@orbiting/backend-modules-auth'

export = async function redeemGiftVoucher(
  _root: never, // eslint-disable-line @typescript-eslint/no-unused-vars
  args: { voucherCode: string }, // eslint-disable-line @typescript-eslint/no-unused-vars
  ctx: GraphqlContext, // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  Auth.ensureUser(ctx.user)

  const giftShop = new GiftShop(ctx.pgdb)
  try {
    await giftShop.redeemVoucher(args.voucherCode, ctx.user.id)

    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
