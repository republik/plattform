import { releaseIdFromVersionId } from '../document'

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
