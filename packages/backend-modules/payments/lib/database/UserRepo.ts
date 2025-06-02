import { UserRow } from '@orbiting/backend-modules-types'
import { PgDb } from 'pogi'

export type Address = {
  name: string
  city: string | null
  line1: string | null
  line2: string | null
  postalCode: string | null
  country: string | undefined
}

export type AddressRow = {
  id: string
  name: string
  city: string | null
  line1: string | null
  line2: string | null
  postalCode: string | null
  country: string | undefined
}

type UserUpdateArgs = {
  firstName?: string | null
  lastName?: string | null
  addressId?: string | null
}

export class UserDataRepo {
  #pgdb: PgDb

  constructor(dbConn: PgDb) {
    this.#pgdb = dbConn
  }

  findUserById(userId: string): Promise<UserRow | null> {
    return this.#pgdb.public.users.findOne({ id: userId })
  }

  updateUser(userId: string, args: UserUpdateArgs) {
    return this.#pgdb.public.users.updateAndGet({ id: userId }, args)
  }

  insertAddress(args: Address): Promise<AddressRow> {
    return this.#pgdb.public.addresses.insertAndGet(args)
  }

  updateAddress(addressId: string, args: Address): Promise<AddressRow> {
    return this.#pgdb.public.addresses.updateAndGet({ id: addressId }, args)
  }
}
