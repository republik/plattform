import { PgDb } from 'pogi'
import { Author, ChangeAuthorArgs } from '../graphql/types'

export class AuthorService {
  protected pgdb: PgDb

  constructor(pgdb: PgDb) {
    this.pgdb = pgdb
  }

  async findAuthor(id: string): Promise<Author | null> {
    const author = await this.pgdb.publikator.authors.findFirst({id: id})
    return author
  }

  async findAllAuthors(): Promise<Author[] | null> {
    const authors = await this.pgdb.publikator.authors.findAll()
    return authors
  }

  async createAuthor(newAuthor: ChangeAuthorArgs): Promise<Author | null> {
    const author = await this.pgdb.publikator.authors.insertAndGet(newAuthor)
    return author
  }

  async updateAuthor(id: string, updatedAuthor: ChangeAuthorArgs): Promise<Author | null> {
    console.log(updatedAuthor)
    const author = await this.pgdb.publikator.authors.updateAndGetOne(id, updatedAuthor)
    return author
  }

}
