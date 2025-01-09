/* eslint-disable @typescript-eslint/no-unused-vars */
import Auth from '@orbiting/backend-modules-auth'
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { GiftVoucherRepo } from '../../../lib/database/GiftVoucherRepo'
import { PgDb } from 'pogi'
import { normalizeVoucher } from '../../../lib/shop/gifts'

type GiftVoucherValidationResult = {
  valid: boolean
  isLegacyVoucher: boolean
}

export = async function (
  _root: never,
  args: { voucher: string },
  ctx: GraphqlContext,
): Promise<GiftVoucherValidationResult> {
  Auth.ensureUser(ctx.user)

  const base32Voucher = normalizeVoucher(args.voucher)
  if (base32Voucher) {
    const isNewVoucher = await new GiftVoucherRepo(ctx.pgdb).getVoucherByCode(
      base32Voucher,
    )

    if (isNewVoucher) {
      return {
        valid: true,
        isLegacyVoucher: false,
      }
    }
  }

  if (await isfLegacyVoucher(ctx.pgdb, args.voucher)) {
    return {
      valid: true,
      isLegacyVoucher: true,
    }
  }

  return {
    valid: false,
    isLegacyVoucher: false,
  }
}

async function isfLegacyVoucher(pgdb: PgDb, code: string) {
  const res = await pgdb.public.memberships.findOne({ voucherCode: code })
  if (res) return true
  return false
}
