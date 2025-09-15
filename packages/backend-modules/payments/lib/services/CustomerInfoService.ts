import { PgDb } from 'pogi'
import { CustomerRepo } from '../database/CutomerRepo'
import { Company, Address } from '../types'
import { Companies } from '../payments'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { StripeCustomerCreateWorker } from '../workers/StripeCustomerCreateWorker'
import { UserDataRepo } from '../database/UserRepo'
import { UserRow } from '@orbiting/backend-modules-types'
import { PaymentService } from './PaymentService'

const RegionNames = new Intl.DisplayNames(['de-CH'], { type: 'region' })

export class CustomerInfoService {
  #pgdb
  #customers: CustomerRepo
  #users: UserDataRepo
  #paymentService: PaymentService

  constructor(pgdb: PgDb) {
    this.#pgdb = pgdb
    this.#customers = new CustomerRepo(pgdb)
    this.#users = new UserDataRepo(pgdb)
    this.#paymentService = new PaymentService()
  }

  async createCustomer(company: Company, userId: string): Promise<string> {
    const user = await this.#users.findUserById(userId)

    if (!user) {
      throw Error(`User ${userId} does not exist`)
    }

    const oldCustomerData = await this.#pgdb.queryOne(
      `SELECT
      s.id as "customerId"
      from "stripeCustomers" s
      JOIN companies c ON s."companyId" = c.id
      WHERE
      "userId" = :userId AND
      c.name = :company`,
      {
        userId,
        company: company,
      },
    )

    let customerId: string
    if (!oldCustomerData || oldCustomerData?.customerId === null) {
      const stripeId = (
        await this.#paymentService.createCustomer(company, user.email, user.id)
      )?.id

      if (!stripeId) {
        throw Error(`Failed to create customer for user ${userId}`)
      }

      customerId = stripeId
    } else {
      customerId = oldCustomerData.customerId
    }

    await this.#customers.saveCustomerIdForCompany(user.id, company, customerId)

    if (!oldCustomerData || oldCustomerData?.customerId === null) {
      // backfill into legacy table to prevent new customers from being created if the old checkout is used
      // get rid of this as soon as possible...
      try {
        const { id: legacyCompanyId } =
          await this.#pgdb.public.companies.findOne({
            name: company,
          })
        await this.#pgdb.public.stripeCustomers.insert({
          id: customerId,
          userId: userId,
          companyId: legacyCompanyId,
        })
      } catch (e) {
        console.error(e)
      }
    }

    return customerId
  }

  async getCustomerIdForCompany(
    userId: string,
    company: Company,
  ): Promise<{ customerId: string; company: Company } | null> {
    const customerInfo = await this.#customers.getCustomerIdForCompany(
      userId,
      company,
    )
    if (!customerInfo) {
      // lookup strip customerIds in the old stripeCustomer table
      const row = await this.#pgdb.queryOne(
        `SELECT
         s.id as "customerId"
         from "stripeCustomers" s
         JOIN companies c ON s."companyId" = c.id
         WHERE
         "userId" = :userId AND
         c.name = :company`,
        {
          userId,
          company: company,
        },
      )
      if (!row) {
        console.log(`No stripe customer for ${userId} and ${company}`)
        return null
      }

      return { customerId: row.customerId, company }
    }
    return customerInfo
  }

  async getUserIdForCompanyCustomer(
    company: Company,
    customerId: string,
  ): Promise<string | null> {
    const customerInfo = await this.#customers.getUserIdForCompanyCustomer(
      company,
      customerId,
    )

    if (customerInfo) {
      return customerInfo.userId
    }

    // lookup strip customerIds in the old stripeCustomer table
    const row = await this.#pgdb.queryOne(
      `SELECT
        s."userId" as "userId"
        from "stripeCustomers" s
        JOIN companies c ON s."companyId" = c.id
        WHERE
        s."id" = :customerId AND
        c.name = :company`,
      {
        customerId,
        company: company,
      },
    )
    if (row) {
      return row.userId
    }

    return null
  }

  async updateCustomerEmail(company: Company, userId: string, email: string) {
    const customer = await this.#customers.getCustomerIdForCompany(
      userId,
      company,
    )
    if (!customer) {
      return null
    }

    return this.#paymentService.updateCustomerEmail(
      company,
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
