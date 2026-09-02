import {
  bodyChildren,
  extractTitleZoneData,
  mdastToPortableText,
} from '../mdastToPortableText'

describe('publikatorSync/mdastToPortableText', () => {
  it('converts a plain paragraph into a normal block', () => {
    const result = mdastToPortableText([
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Hello world' }],
      },
    ]) as Array<Record<string, unknown>>

    expect(result).toHaveLength(1)
    expect(result[0]._type).toBe('block')
    expect(result[0].style).toBe('normal')
    const children = result[0].children as Array<Record<string, unknown>>
    expect(children[0].text).toBe('Hello world')
  })

  it('drops empty paragraphs', () => {
    const result = mdastToPortableText([
      { type: 'paragraph', children: [{ type: 'text', value: '   ' }] },
      { type: 'paragraph', children: [{ type: 'text', value: 'Real text' }] },
    ]) as Array<Record<string, unknown>>

    expect(result).toHaveLength(1)
  })

  it('styles the question paragraph and voice-tags the answer', () => {
    const nodes = [
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Wie geht es Ihnen?' }],
      },
      {
        type: 'zone',
        identifier: 'INTERVIEWANSWER',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', value: 'Mir geht es gut.' }],
          },
        ],
      },
    ]

    const result = mdastToPortableText(
      nodes,
      false,
      undefined,
      'huebsch-62964-rpblk',
    ) as Array<Record<string, unknown>>

    expect(result).toHaveLength(2)
    const [question, answer] = result
    expect(question.style).toBe('interviewQuestion')

    const answerChildren = answer.children as Array<Record<string, unknown>>
    expect(answerChildren[0]).toMatchObject({
      _type: 'voiceTag',
      voice: 'huebsch-62964-rpblk',
    })
  })

  it('extracts title/description/byline from a TITLE zone', () => {
    const nodes = [
      {
        type: 'zone',
        identifier: 'TITLE',
        children: [
          {
            type: 'heading',
            depth: 1,
            children: [{ type: 'text', value: 'Der Titel' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', value: 'Die Lead-Zeile' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', value: 'Von Jane Doe' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Body text' }],
      },
    ]

    const { title, description, byline } = extractTitleZoneData(nodes)
    expect((title?.[0] as any).children[0].text).toBe('Der Titel')
    expect((description?.[0] as any).children[0].text).toBe('Die Lead-Zeile')
    expect((byline?.[0] as any).children[0].text).toBe('Von Jane Doe')

    const body = mdastToPortableText(
      bodyChildren(nodes),
    ) as Array<Record<string, unknown>>
    expect(body).toHaveLength(1)
    expect(((body[0].children as any[])[0] as any).text).toBe('Body text')
  })
})
