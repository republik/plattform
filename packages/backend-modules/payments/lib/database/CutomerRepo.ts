import { PgDb } from 'pogi'
import { Company } from '../types'

export interface PaymentCustomerRepo {
  getUserIdForCompanyCustomer(
    company: Company,
    customerId: string,
  ): Promise<{ userId: string; company: Company } | null>
  getCustomerIdForCompany(
    userId: string,
    company: Company,
  ): Promise<{ customerId: string; company: Company } | null>
  saveCustomerIdForCompany(
    userId: string,
    company: Company,
    customerId: string,
  ): Promise<string>
  saveCustomerIds(
    userId: string,
    customerIds: { customerId: string; company: string }[],
  ): Promise<void>
}

export class CustomerRepo {
  #pgdb: PgDb

  constructor(dbConn: PgDb) {
    this.#pgdb = dbConn
  }

  getUserIdForCompanyCustomer(
    company: Company,
    customerId: string,
  ): Promise<{ userId: string; company: Company } | null> {
    return this.#pgdb.payments.stripeCustomers.findOne(
      {
        customerId,
        company,
      },
      { fields: ['userId', 'company'] },
    )
  }

  getCustomerIdForCompany(
    userId: string,
    company: Company,
  ): Promise<{ customerId: string; company: Company } | null> {
    return this.#pgdb.payments.stripeCustomers.findOne(
      {
        userId,
        company,
      },
      { fields: ['customerId', 'company'] },
    )
  }

  saveCustomerIdForCompany(
    userId: string,
    company: Company,
    customerId: string,
  ): Promise<string> {
    return this.#pgdb.payments.stripeCustomers.insertAndGet(
      {
        userId,
        company,
        customerId,
      },
      { return: ['id'] },
    )
  }

  saveCustomerIds(
    userId: string,
    customerIds: { customerId: string; company: string }[],
  ): Promise<void> {
    const values = customerIds.map((c) => {
      return { userId, company: c.company, customerId: c.customerId }
    })

    return this.#pgdb.payments.stripeCustomers.insert(values)
  }
}
