import { draftIdFor, publishedIdFor, releaseIdFromVersionId } from '../document'

describe('releaseIdFromVersionId', () => {
  it('extracts the release name from a version id', () => {
    expect(releaseIdFromVersionId('versions.spring-issue.abc123')).toBe(
      'spring-issue',
    )
  })

  it('returns undefined for a draft or published id', () => {
    expect(releaseIdFromVersionId('drafts.abc123')).toBeUndefined()
    expect(releaseIdFromVersionId('abc123')).toBeUndefined()
  })

  it('does not mistake an id that merely contains a prefix word', () => {
    expect(releaseIdFromVersionId('article-versions.abc')).toBeUndefined()
  })
})

describe('publishedIdFor', () => {
  it('strips the drafts prefix', () => {
    expect(publishedIdFor('drafts.abc123')).toBe('abc123')
  })

  it('strips the versions prefix and release id', () => {
    expect(publishedIdFor('versions.spring-issue.abc123')).toBe('abc123')
  })

  it('leaves a bare published id unchanged', () => {
    expect(publishedIdFor('abc123')).toBe('abc123')
  })
})

describe('draftIdFor', () => {
  it('prefixes a bare published id', () => {
    expect(draftIdFor('abc123')).toBe('drafts.abc123')
  })

  it('derives the draft id from a version id', () => {
    expect(draftIdFor('versions.spring-issue.abc123')).toBe('drafts.abc123')
  })

  it('is a no-op on an id that is already a draft id', () => {
    expect(draftIdFor('drafts.abc123')).toBe('drafts.abc123')
  })
})
