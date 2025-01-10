import { PgDb } from 'pogi'
import { CustomerRepo } from '../database/CutomerRepo'
import { Company, Address } from '../types'
import { PaymentProvider } from '../providers/provider'
import { Companies } from '../payments'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { StripeCustomerCreateWorker } from '../workers/StripeCustomerCreateWorker'
import { UserDataRepo } from '../database/UserRepo'
import { UserRow } from '@orbiting/backend-modules-types'

const RegionNames = new Intl.DisplayNames(['de-CH'], { type: 'region' })

export class CustomerInfoService {
  #pgdb
  #customers: CustomerRepo

  constructor(pgdb: PgDb) {
    this.#pgdb = pgdb
    this.#customers = new CustomerRepo(pgdb)
  }

  async updateCustomerEmail(company: Company, userId: string, email: string) {
    const customer = await this.#customers.getCustomerIdForCompany(
      userId,
      company,
    )
    if (!customer) {
      return null
    }

    PaymentProvider.forCompany(company).updateCustomerEmail(
      customer.customerId,
      email,
    )
  }

  async updateUserAddress(
    userId: string,
    addressData: Address,
  ): Promise<UserRow> {
    const tx = await this.#pgdb.transactionBegin()
    const txUserRepo = new UserDataRepo(tx)
    try {
      const user = await txUserRepo.findUserById(userId)
      if (!user) {
        throw Error(`User ${userId} does not exist`)
      }

      const args = {
        name: `${user.firstName} ${user.lastName}`,
        city: addressData.city,
        line1: addressData.line1,
        line2: addressData.line2,
        postalCode: addressData.postal_code,
        country: RegionNames.of(addressData.country!),
      }

      if (user.addressId) {
        await tx.public.addresses.update({ id: user.addressId }, args)
      } else {
        const address = await txUserRepo.insertAddress(args)

        await txUserRepo.updateUser(user.id, {
          addressId: address.id,
        })
      }

      tx.transactionCommit()
      return user
    } catch (e) {
      console.log(e)
      await tx.transactionRollback()
      throw e
    }
  }

  async ensureUserHasCustomerIds(userId: string): Promise<void> {
    const tasks = Companies.map(async (company) => {
      const customer = await this.#pgdb.payments.stripeCustomers.findOne({
        userId,
        company,
      })

      if (!customer) {
        await Queue.getInstance().send<StripeCustomerCreateWorker>(
          'payments:stripe:customer:create',
          {
            $version: 'v1',
            userId,
            company,
          },
          {
            priority: 1000,
            singletonKey: `stripe:customer:create:for:${userId}:${company}`,
            singletonHours: 1,
            retryLimit: 5,
            retryDelay: 500,
          },
        )
      }
    })

    await Promise.all(tasks)
  }
}
