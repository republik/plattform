import type { GraphqlContext } from '@orbiting/backend-modules-types'
import { Author, ChangeAuthorArgs } from '../../types'
import { AuthorService } from '../../../lib/AuthorService'

export = async function addAuthor(
  _: any,
  args: ChangeAuthorArgs,
  ctx: GraphqlContext,
): Promise<Author | null> {
  const authorService = new AuthorService(ctx.pgdb)
  const newAuthor = await authorService.createAuthor(args)
  return newAuthor
}
