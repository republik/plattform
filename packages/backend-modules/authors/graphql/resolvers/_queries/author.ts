import type { GraphqlContext } from '@orbiting/backend-modules-types'
import { Author } from '../../types'
import { AuthorService } from '../../../lib/AuthorService'

type AuthorArgs = {
  id: string
}

export = async function author(
  _: any,
  { id }: AuthorArgs,
  ctx: GraphqlContext,
): Promise<Author | null> {
  const authorService = new AuthorService(ctx.pgdb)
  const author = await authorService.findAuthor(id)
  console.log('here: ' + JSON.stringify(author))
  return author
}
