import { v4 as isUuid } from 'is-uuid'
import { PgTable } from 'pogi'

import createDataLoader from '@orbiting/backend-modules-dataloader'
import auth from '@orbiting/backend-modules-auth'
import { UserRow } from '@orbiting/backend-modules-types'

const transformUser = auth.transformUser

function nonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

module.exports = (context: any) => {
  const users: PgTable<UserRow> = context.pgdb.public.users
  const credentials: PgTable<any> = context.pgdb.public.credentials
  return {
    byId: createDataLoader((ids: readonly string[]) => {
      const userIds = ids.filter(isUuid)

      if (!userIds.length) {
        return Promise.resolve([])
      }

      return users
        .find({ id: userIds })
        .then((users) => users.map(transformUser).filter(nonNullable))
    }),
    byEmail: createDataLoader(
      (emails: readonly string[]) =>
        users
          .find({ email: emails })
          .then((users) => users.map(transformUser).filter(nonNullable)),
      null,
      (key, rows) =>
        rows.find((row) => {
          if (!row) return
          return row._raw.email.toLowerCase() === key.toLowerCase()
        }),
    ),
    byIdOrEmail: createDataLoader(
      (values: readonly string[]) => {
        const ids = values.filter(isUuid)
        const emails = values.filter((v) => !ids.includes(v))

        const or = [
          ids.length > 0 && { id: ids },
          emails.length > 0 && { email: emails },
        ].filter(Boolean)

        if (or.length === 0) {
          return Promise.resolve([])
        }

        return users
          .find({ or })
          .then((users) => users.map(transformUser).filter(nonNullable))
      },
      null,
      (key, rows) =>
        rows.find((row) => {
          if (!row) return

          return (
            row._raw.id === key ||
            row._raw.email.toLowerCase() === key.toLowerCase()
          )
        }),
    ),
    byUsername: createDataLoader(
      (usernames: readonly string[]) =>
        users
          .find({ username: usernames })
          .then((users) => users.map(transformUser).filter(nonNullable)),
      null,
      (key, rows) =>
        rows.find((row) => {
          if (!row) return
          return row.username.toLowerCase() === key.toLowerCase()
        }),
    ),
    credential: createDataLoader((ids) => credentials.find({ id: ids })),
  }
}
