import { GraphqlContext } from '@orbiting/backend-modules-types'
import DataLoader from 'dataloader'

type Credential = {
  id: string
  userId: string
  description: string
  isListed: boolean
  verified: boolean
}

export = (context: GraphqlContext) =>
  new DataLoader<string, Credential | null>(
    async (ids) => {
      const results = await context.pgdb.public.credentials.find({ id: ids })

      const credentials = new Map()

      results.forEach((c: Credential) => credentials.set(c.id, c))

      return ids.map((id) => credentials.get(id) || null)
    },
    {
      maxBatchSize: 1000,
    },
  )
