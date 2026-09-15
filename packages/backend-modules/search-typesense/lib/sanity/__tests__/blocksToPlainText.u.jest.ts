import { blocksToPlainText } from '../blocksToPlainText'

const span = (text: string) => ({ _type: 'span', text })
const block = (text: string) => ({ _type: 'block', children: [span(text)] })

describe('blocksToPlainText', () => {
  it('reads plain block spans', () => {
    expect(blocksToPlainText([block('Hallo'), block('Welt')])).toBe('Hallo\nWelt')
  })

  it('returns an empty string for non-array input', () => {
    expect(blocksToPlainText(undefined)).toBe('')
    expect(blocksToPlainText(null)).toBe('')
  })

  it('does not silently drop text inside a custom block type (infoBox)', () => {
    const blocks = [
      block('Vor der Box.'),
      {
        _type: 'infoBox',
        title: 'Titel',
        body: [block('Inhalt der Box.')],
      },
      block('Nach der Box.'),
    ]
    expect(blocksToPlainText(blocks)).toBe(
      'Vor der Box.\nTitel\nInhalt der Box.\nNach der Box.',
    )
  })

  it('reads a blockQuote body and caption', () => {
    const blocks = [
      {
        _type: 'blockQuote',
        body: [block('Ein Zitat.')],
        caption: 'Zitiert von jemandem',
      },
    ]
    expect(blocksToPlainText(blocks)).toBe('Ein Zitat.\nZitiert von jemandem')
  })

  it('drops content-free block types (divider, html) without throwing', () => {
    const blocks = [block('Text'), { _type: 'divider' }, { _type: 'html' }]
    expect(blocksToPlainText(blocks)).toBe('Text')
  })
})
