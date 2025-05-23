import type { GraphqlContext } from '@orbiting/backend-modules-types'
import { Author, ChangeAuthorArgs } from '../../types'
import { AuthorService } from '../../../lib/AuthorService'

type UpdateAuthorArgs = {
  id: string
} & ChangeAuthorArgs

export = async function updateAuthor(
  _: any,
  args: UpdateAuthorArgs,
  ctx: GraphqlContext,
): Promise<Author | null> {
  const { id } = args
  const authorService = new AuthorService(ctx.pgdb)
  const newAuthor = await authorService.updateAuthor(id, {
    firstName: args.firstName,
    lastName: args.lastName,
  })
  return newAuthor
}
