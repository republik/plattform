import { GraphqlContext } from '@orbiting/backend-modules-types'
import DataLoader from 'dataloader'

interface Key {
  userId: string
  discussionId: string
}

interface DiscussionPreference {
  userId: string
  discussionId: string
  [key: string]: any
}

function toKey({ userId, discussionId }: Key) {
  return `${userId}:${discussionId}`
}

export = (context: GraphqlContext) => ({
  byUserIdAndDiscussionId: new DataLoader<
    Key,
    DiscussionPreference | null,
    string
  >(
    async (keys) => {
      const stringKeys = keys.map(toKey)

      const results = await context.pgdb.public.query(
        `select
          *,
          ("userId"::text || ':' || "discussionId"::text) as _dataloader_lookup_key
          FROM public."discussionPreferences" dp
          WHERE ("userId"::text || ':' || "discussionId"::text) = ANY(:keys)`,
        { keys: stringKeys },
      )

      const preferences = new Map()

      results.forEach((preference: DiscussionPreference) => {
        const lookup_key = preference._dataloader_lookup_key
        delete preference._dataloader_lookup_key
        preferences.set(lookup_key, preference)
      })

      return stringKeys.map((k) => preferences.get(k) || null)
    },
    {
      cacheKeyFn: toKey,
    },
  ),
})
