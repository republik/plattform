import { PgDb } from 'pogi'
import { UserRow } from '@orbiting/backend-modules-types'
import { UserDataRepo, Address, AddressRow } from '../database/UserRepo'

export class UserService {
  protected pgdb: PgDb
  protected users: UserDataRepo

  constructor(pgdb: PgDb) {
    this.pgdb = pgdb
    this.users = new UserDataRepo(pgdb)
  }

  async updateUserName(
    userId: string,
    firstName: string,
    lastName: string,
  ): Promise<UserRow> {
    const tx = await this.pgdb.transactionBegin()
    const txUserRepo = new UserDataRepo(tx)
    try {
      const user = await txUserRepo.updateUser(userId, { firstName, lastName })
      await tx.transactionCommit()
      return user
    } catch (e) {
      console.log(e)
      await tx.transactionRollback()
      throw e
    }
  }

  async insertAddress(data: Address): Promise<AddressRow> {
    return this.users.insertAddress(data)
  }
}
