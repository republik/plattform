import { buildDiscussionDoc, discussionIdForArticle } from '../discussionDoc'

describe('publikatorSync/discussionDoc', () => {
  it('derives a deterministic id from the article id alone', () => {
    const id1 = discussionIdForArticle('article-abc')
    const id2 = discussionIdForArticle('article-abc')
    const id3 = discussionIdForArticle('article-xyz')

    expect(id1).toBe(id2)
    expect(id1).not.toBe(id3)
  })

  it('builds title from portable text, path from the slug, and passes discussionClosed through', () => {
    const doc = buildDiscussionDoc(
      'article-abc',
      {
        title: [
          { _type: 'block', children: [{ _type: 'span', text: 'Der Titel' }] },
        ],
        slug: { current: '/2024/01/01/der-titel' },
      },
      true,
    )

    expect(doc._type).toBe('discussion')
    expect(doc._id).toBe(discussionIdForArticle('article-abc'))
    expect(doc.title).toBe('Der Titel')
    expect(doc.path).toBe('/2024/01/01/der-titel')
    expect(doc.discussionClosed).toBe(true)
    expect(doc.discussionAnonymity).toBe('ALLOWED')
    expect(doc.tagRequired).toBe(false)
  })

  it('falls back to the slug, then the article id, when there is no title', () => {
    const withSlug = buildDiscussionDoc(
      'article-abc',
      { slug: { current: '/2024/01/01/der-titel' } },
      false,
    )
    expect(withSlug.title).toBe('/2024/01/01/der-titel')

    const withNeither = buildDiscussionDoc('article-abc', {}, false)
    expect(withNeither.title).toBe('article-abc')
  })

  it('omits path when there is no slug yet', () => {
    const doc = buildDiscussionDoc('article-abc', {}, false)
    expect(doc.path).toBeUndefined()
  })
})
