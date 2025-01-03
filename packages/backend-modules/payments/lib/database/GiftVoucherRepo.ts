import { PgDb } from 'pogi'
import { Voucher } from '../shop/gifts'
import { Company } from '../types'

type UpdateableVoucher = {
  redeemedBy: string | null
  redeemedForCompany: Company | null
  redeemedAt: Date | null
}

export class GiftVoucherRepo {
  #pgdb
  constructor(pgdb: PgDb) {
    this.#pgdb = pgdb
  }

  getVoucherByCode(code: string): Promise<Voucher> {
    return this.#pgdb.payments.giftVouchers.findOne({ code })
  }

  saveVoucher(voucher: Voucher): Promise<Voucher> {
    return this.#pgdb.payments.giftVouchers.insert(voucher)
  }

  updateVoucher(id: string, voucher: UpdateableVoucher): Promise<Voucher> {
    return this.#pgdb.payments.giftVouchers.update({ id }, voucher)
  }
}
