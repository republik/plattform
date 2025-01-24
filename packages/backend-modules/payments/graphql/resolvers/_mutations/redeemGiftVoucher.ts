import { GraphqlContext } from '@orbiting/backend-modules-types'
import { GiftShop } from '../../../lib/shop/gifts'
import { default as Auth } from '@orbiting/backend-modules-auth'

type RedeemGiftResult = {
  status: 'success' | 'error'
  aboType?: string
  starting?: Date
}

export = async function redeemGiftVoucher(
  _root: never, // eslint-disable-line @typescript-eslint/no-unused-vars
  args: { voucherCode: string },
  ctx: GraphqlContext,
): Promise<RedeemGiftResult> {
  Auth.ensureUser(ctx.user)

  const giftShop = new GiftShop(ctx.pgdb)
  try {
    const res = await giftShop.redeemVoucher(args.voucherCode, ctx.user.id)

    return {
      status: 'success',
      aboType: res.aboType,
      starting: res.starting,
    }
  } catch (e) {
    console.error(e)
    return {
      status: 'error',
    }
  }
}
