/* eslint-disable @typescript-eslint/no-unused-vars */
import Auth from '@orbiting/backend-modules-auth'
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { GiftVoucherRepo } from '../../../lib/database/GiftVoucherRepo'
import { PgDb } from 'pogi'
import { normalizeVoucher } from '../../../lib/shop/gifts'
import { Company } from '../../../lib/types'

type GiftVoucherValidationResult = {
  type?: string
  company?: Company
  valid: boolean
  isLegacyVoucher: boolean
}

export = async function (
  _root: never,
  args: { voucherCode: string },
  ctx: GraphqlContext,
): Promise<GiftVoucherValidationResult> {
  Auth.ensureUser(ctx.user)

  const base32Voucher = normalizeVoucher(args.voucherCode)
  if (base32Voucher) {
    const voucher = await new GiftVoucherRepo(ctx.pgdb).getVoucherByCode(
      base32Voucher,
    )

    if (voucher && voucher.redeemedAt === null) {
      return {
        type: voucher.giftId,
        company: voucher.issuedBy,
        valid: true,
        isLegacyVoucher: false,
      }
    }
  }

  if (await isfLegacyVoucher(ctx.pgdb, args.voucherCode)) {
    return {
      type: 'MEMBERSHIP',
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
