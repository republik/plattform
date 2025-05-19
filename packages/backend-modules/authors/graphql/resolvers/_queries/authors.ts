import type { GraphqlContext } from '@orbiting/backend-modules-types'
import { Author } from '../../types'
import { AuthorService } from '../../../lib/AuthorService'

export = async function authors(
  _: any,
  args: any,
  ctx: GraphqlContext,
): Promise<Author[] | null> {
  const authorService = new AuthorService(ctx.pgdb)
  const authors = await authorService.findAllAuthors()
  return authors
}
