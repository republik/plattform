import { isArticleLikeMeta } from '../eligibility'

describe('publikatorSync/eligibility isArticleLikeMeta', () => {
  it('treats missing meta as article-like (conservative default)', () => {
    expect(isArticleLikeMeta(undefined)).toBe(true)
    expect(isArticleLikeMeta(null)).toBe(true)
  })

  it('treats a plain article/editorialNewsletter/undefined template as article-like', () => {
    expect(isArticleLikeMeta({ template: 'article' })).toBe(true)
    expect(isArticleLikeMeta({ template: 'editorialNewsletter' })).toBe(true)
    expect(isArticleLikeMeta({})).toBe(true)
  })

  it('rejects format/section/page/front templates', () => {
    for (const template of ['format', 'section', 'page', 'front']) {
      expect(isArticleLikeMeta({ template })).toBe(false)
    }
  })

  it('rejects templates (Vorlagen)', () => {
    expect(isArticleLikeMeta({ template: 'article', isTemplate: true })).toBe(
      false,
    )
  })

  it('rejects a series-overview object but allows a series episode string ref', () => {
    expect(isArticleLikeMeta({ series: { episodes: [] } })).toBe(false)
    expect(isArticleLikeMeta({ series: 'republik/some-series' })).toBe(true)
  })
})
