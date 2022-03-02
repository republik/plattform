import { v4 as isUuid } from 'is-uuid'

import createDataLoader from '@orbiting/backend-modules-dataloader'
import transformUser from '@orbiting/backend-modules-auth/lib/transformUser'
import { PgTable } from 'pogi'

export interface UserRow {
  id: string
  username: string
  firstName: string
  lastName: string
  name: string
  initials: string
  hasPublicProfile: boolean
  roles: string[]
  email: string
}

module.exports = (context: any) => {
  const users: PgTable<UserRow> = context.pgdb.public.users
  const credentials: PgTable<any> = context.pgdb.public.credentials
  return {
    byId: createDataLoader((ids: readonly string[]) =>
      users
        .find({ id: ids })
        .then((users) => users.map((u) => transformUser(u))),
    ),
    byEmail: createDataLoader(
      (emails: readonly string[]) =>
        users.find({ email: emails }).then((users) => users.map(transformUser)),
      null,
      (key, rows) =>
        rows.find((row) => {
          if (!row) return
          return row._raw.email.toLowerCase() === key.toLowerCase()
        }),
    ),
    byIdOrEmail: createDataLoader(
      async (values: readonly string[]) => {
        const ids = values.filter(isUuid)
        const emails = values.filter((v) => !ids.includes(v))

        const or = [
          ids.length > 0 && { id: ids },
          emails.length > 0 && { email: emails },
        ].filter(Boolean)

        if (or.length === 0) {
          return []
        }

        return users.find({ or }).then((users) => users.map(transformUser))
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
          .then((users) => users.map(transformUser)),
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
