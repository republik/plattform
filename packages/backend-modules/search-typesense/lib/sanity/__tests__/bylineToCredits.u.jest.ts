import { bylineToCredits } from '../bylineToCredits'

describe('bylineToCredits', () => {
  it('returns undefined for an empty or missing byline', () => {
    expect(bylineToCredits(undefined)).toBeUndefined()
    expect(bylineToCredits([])).toBeUndefined()
  })

  it('keeps plain text spans as text nodes', () => {
    const byline = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Von Anna, 1. Januar 2026' }],
      },
    ]
    expect(bylineToCredits(byline)).toEqual([
      { type: 'text', value: 'Von Anna, 1. Januar 2026' },
    ])
  })

  it('turns an internalLink span with a resolved contributorSlug into a profile link', () => {
    const byline = [
      {
        _type: 'block',
        markDefs: [{ _key: 'm1', _type: 'internalLink', contributorSlug: 'anna' }],
        children: [{ _type: 'span', text: 'Anna', marks: ['m1'] }],
      },
    ]
    expect(bylineToCredits(byline)).toEqual([
      {
        type: 'link',
        url: '/~anna',
        children: [{ type: 'text', value: 'Anna' }],
      },
    ])
  })

  it('falls back to plain text when the internalLink has no resolved contributorSlug', () => {
    const byline = [
      {
        _type: 'block',
        markDefs: [{ _key: 'm1', _type: 'internalLink' }],
        children: [{ _type: 'span', text: 'Anna', marks: ['m1'] }],
      },
    ]
    expect(bylineToCredits(byline)).toEqual([{ type: 'text', value: 'Anna' }])
  })
})
