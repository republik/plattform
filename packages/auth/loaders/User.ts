// const { v4: isUuid } = require('is-uuid')
import {v4 as isUuid} from 'is-uuid'

import { default as createDataLoader } from '@orbiting/backend-modules-dataloader'
import { transformUser } from '@orbiting/backend-modules-auth'
import {PgTable} from 'pogi';

module.exports = (context: any) => {
  const users: PgTable<any> = context.pgdb.public.users;
  const credentials: PgTable<any> = context.pgdb.public.credentials;
  return {
    byId: createDataLoader((ids: readonly string[]) =>
      users.find({ id: ids })
        .then(users => users
          .map(u => transformUser(u))
        )
    ),
    byIdOrEmail: createDataLoader(
      async (values: readonly string[]) => {
        const ids = values.filter(isUuid)
        const emails = values.filter(v => !ids.includes(v))

        const or = [
          ids.length > 0 && { id: ids },
          emails.length > 0 && { email: emails }
        ].filter(Boolean)

        if (or.length === 0) {
          return []
        }

        return users.find({ or })
          .then(users => users.map(transformUser))
      },
      null,
      (value, rows) => rows.find(row => (
        row._raw.id === value ||
        row._raw.email.toLowerCase() === value.toLowerCase()
      ))
    ),
    byUsername: createDataLoader(
      usernames =>
        users.find({ username: usernames })
          .then(users => users.map(transformUser),
      null,
      (key, rows) => rows.find(row => row.username.toLowerCase() === key.toLowerCase())
    ),
    credential: createDataLoader(ids =>
      credentials.find({ id: ids })
    )
  }
}
