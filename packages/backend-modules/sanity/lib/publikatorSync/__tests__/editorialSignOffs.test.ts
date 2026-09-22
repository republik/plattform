import { buildEditorialSignOffs } from '../editorialSignOffs'

describe('publikatorSync/editorialSignOffs buildEditorialSignOffs', () => {
  it('maps known milestone names to their Sanity itemKey, including the finalControl -> endkontrolleOk rename', () => {
    const result = buildEditorialSignOffs([
      {
        name: 'startCreation',
        userId: 'user-1',
        author: { name: 'Jane Doe' },
        createdAt: '2026-09-09T08:41:47.390Z',
      },
      {
        name: 'finalControl',
        userId: 'user-2',
        author: { name: 'John Doe' },
        createdAt: '2026-09-11T07:40:57.671Z',
      },
    ])

    expect(result).toEqual([
      {
        _key: 'startCreation',
        _type: 'signOff',
        itemKey: 'startCreation',
        userId: 'user-1',
        userName: 'Jane Doe',
        signedAt: '2026-09-09T08:41:47.390Z',
      },
      {
        _key: 'endkontrolleOk',
        _type: 'signOff',
        itemKey: 'endkontrolleOk',
        userId: 'user-2',
        userName: 'John Doe',
        signedAt: '2026-09-11T07:40:57.671Z',
      },
    ])
  })

  it('drops milestone names with no Sanity checklist slot', () => {
    const result = buildEditorialSignOffs([
      {
        name: 'startTC',
        userId: 'user-1',
        author: { name: 'Jane Doe' },
        createdAt: '2026-09-09T08:41:47.390Z',
      },
      {
        name: 'numbersOk',
        userId: 'user-1',
        author: { name: 'Jane Doe' },
        createdAt: '2026-09-09T08:41:47.390Z',
      },
      {
        name: 'proofReadingOk',
        userId: 'user-1',
        author: { name: 'Jane Doe' },
        createdAt: '2026-09-09T08:41:47.390Z',
      },
    ])

    expect(result).toEqual([
      expect.objectContaining({ itemKey: 'proofReadingOk' }),
    ])
  })

  it('omits userId/userName when absent, without failing', () => {
    const result = buildEditorialSignOffs([
      {
        name: 'startCreation',
        createdAt: '2026-09-09T08:41:47.390Z',
      },
    ])

    expect(result).toEqual([
      {
        _key: 'startCreation',
        _type: 'signOff',
        itemKey: 'startCreation',
        signedAt: '2026-09-09T08:41:47.390Z',
      },
    ])
  })

  it('returns undefined for an empty list or a list with no mappable milestones', () => {
    expect(buildEditorialSignOffs([])).toBeUndefined()
    expect(
      buildEditorialSignOffs([
        { name: 'startTC', createdAt: '2026-09-09T08:41:47.390Z' },
      ]),
    ).toBeUndefined()
  })
})
