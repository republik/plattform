// Tests for the portable-text -> Huebsch speakable-block transform.
//
// Testing policy (applies to this whole test suite, not just this file):
// an AI editing this codebase must never "fix" a failing test by weakening,
// deleting, or rewriting its assertions to match broken behavior. If a test
// fails, the fix belongs in the source it's testing — unless a human
// reviewing the change decides the test itself encoded the wrong behavior,
// in which case that's a deliberate, explained change, not a silent one.
//
// These tests exercise the public contract only (`buildSpeakableContent`,
// `plainText`, `plainTitle`, `SpeakableContentError`) rather than reaching
// into internal helpers — partly because that's what actually matters (the
// shape Huebsch receives), and partly because it's harder to accidentally
// (or deliberately) game: you can't make an internal helper report success
// without the public function's actual output changing.

import {
  buildSpeakableContent,
  plainText,
  plainTitle,
  SpeakableContentError,
} from '../textToSpeech'

const block = (text: string, style = 'normal') => ({
  _type: 'block',
  style,
  children: [{ _type: 'span', text }],
})

const portableText = (text: string) => [block(text)]

const paragraphs = (result: unknown[]) =>
  (result as any[])
    .filter((n) => n.type === 'paragraph')
    .map((n) => ({ role: n.attrs.meta.role, text: n.content[0].text }))

// The credits paragraph carries structured author names in its meta, which
// the role/text projection above deliberately drops (keeping every other
// assertion in this file a plain two-key comparison).
const creditsOf = (result: unknown[]) => {
  const node = (result as any[]).find(
    (n) => n.type === 'paragraph' && n.attrs.meta.role === 'credits',
  )
  return (
    node && { text: node.content[0].text, authors: node.attrs.meta.authors }
  )
}

const pauseDurations = (result: unknown[]) =>
  (result as any[]).filter((n) => n.type === 'pause').map((n) => n.attrs.pause)

describe('buildSpeakableContent', () => {
  it('throws SpeakableContentError when content has no speakable text', () => {
    expect(() => buildSpeakableContent({ content: [] }, 'voice-a')).toThrow(
      SpeakableContentError,
    )
  })

  it('brackets the whole thing with the jingle and stinger sounds', () => {
    const result = buildSpeakableContent(
      { content: portableText('Hallo.') },
      'voice-a',
    ) as any[]
    expect(result[0]).toEqual({
      type: 'sound',
      attrs: { soundName: 'Republik: Jingle' },
    })
    expect(result[result.length - 1]).toEqual({
      type: 'sound',
      attrs: { soundName: 'Republik: Stinger' },
    })
  })

  it('includes title and lead when present, each followed by a 1.4s pause', () => {
    const result = buildSpeakableContent(
      {
        title: portableText('Der Titel'),
        description: portableText('Der Lead'),
        content: portableText('Absatz.'),
      },
      'voice-a',
    )
    expect(paragraphs(result)).toEqual(
      expect.arrayContaining([
        { role: 'title', text: 'Der Titel.' },
        { role: 'lead', text: 'Der Lead.' },
      ]),
    )
  })

  it('omits title/lead paragraphs entirely when the fields are empty', () => {
    const result = buildSpeakableContent(
      { content: portableText('Absatz.') },
      'voice-a',
    )
    const roles = paragraphs(result).map((p) => p.role)
    expect(roles).not.toContain('title')
    expect(roles).not.toContain('lead')
  })

  describe('credits notice', () => {
    it('prefers the structured contributors over parsing the byline', () => {
      const result = buildSpeakableContent(
        {
          byline: portableText(
            'Ein Beitrag von Jane Doe (Text) und Max Muster (Bild) 12.05.2023',
          ),
          contributors: [
            { kind: 'Text', name: 'Erika Beispiel' },
            // no role recorded at all — studio treats that as a text author
            { name: 'Hans Muster' },
            { kind: 'Übersetzung', name: 'Jean Exemple' },
            { kind: 'voice', name: 'Vera Stimme' },
            { kind: 'Bild', name: 'Beat Bild' },
          ],
          content: portableText('Absatz.'),
        },
        'voice-a',
      )
      const credits = creditsOf(result)
      expect(credits?.authors).toEqual([
        'Erika Beispiel',
        'Hans Muster',
        'Jean Exemple',
      ])
      expect(credits?.text).toBe(
        'Ein Beitrag von Erika Beispiel, Hans Muster und Jean Exemple, ' +
          'vorgelesen von einer synthetischen Stimme.',
      )
    })

    it('falls back to the byline when contributors is empty or names nobody usable', () => {
      const byline = portableText(
        'Ein Beitrag von Jane Doe (Text) und Max Muster (Bild) 12.05.2023',
      )
      const fromEmpty = buildSpeakableContent(
        { byline, contributors: [], content: portableText('Absatz.') },
        'voice-a',
      )
      const fromImageOnly = buildSpeakableContent(
        {
          byline,
          contributors: [{ kind: 'Bild', name: 'Beat Bild' }],
          content: portableText('Absatz.'),
        },
        'voice-a',
      )
      for (const result of [fromEmpty, fromImageOnly]) {
        const credits = creditsOf(result)
        expect(credits?.authors).toEqual(['Jane Doe'])
      }
    })

    it('extracts only text/translation authors from a byline, dropping image credits', () => {
      const result = buildSpeakableContent(
        {
          byline: portableText(
            'Ein Beitrag von Jane Doe (Text) und Max Muster (Bild) 12.05.2023',
          ),
          content: portableText('Absatz.'),
        },
        'voice-a',
      )
      const credits = creditsOf(result)
      expect(credits?.text).toBe(
        'Ein Beitrag von Jane Doe, vorgelesen von einer synthetischen Stimme.',
      )
      expect(credits?.authors).toEqual(['Jane Doe'])
    })

    it('falls back to the generic notice when the byline does not match the expected pattern', () => {
      const result = buildSpeakableContent(
        {
          byline: portableText('von Jane Doe, 16. Juli 2026'), // foreign date formating breaks the regex
          content: portableText('Absatz.'),
        },
        'voice-a',
      )
      const credits = creditsOf(result)
      expect(credits?.text).toContain(
        'Dieser Beitrag wird von einer synthetischen Stimme vorgelesen.',
      )
    })

    it('uses just the generic notice when there is no byline at all', () => {
      const result = buildSpeakableContent(
        { content: portableText('Absatz.') },
        'voice-a',
      )
      const credits = creditsOf(result)
      expect(credits?.text).toBe(
        'Dieser Beitrag wird von einer synthetischen Stimme vorgelesen.',
      )
    })
  })

  describe('paragraph pausing', () => {
    it('inserts no pause between two plain paragraphs', () => {
      const result = buildSpeakableContent(
        { content: [block('Erster.'), block('Zweiter.')] },
        'voice-a',
      )
      // "Erster." and "Zweiter." must be back-to-back, with no pause node
      // sandwiched between them (the only pause in the whole result is the
      // fixed 1.4s one following the credits paragraph).
      const blocks = result as any[]
      const first = blocks.findIndex((n) => n.content?.[0]?.text === 'Erster.')
      const second = blocks.findIndex(
        (n) => n.content?.[0]?.text === 'Zweiter.',
      )
      expect(second).toBe(first + 1)

      const durations = pauseDurations(result)
      expect(durations).toEqual([1.4])
    })

    it('treats a divider as a caesura: 1.4s pause instead of none', () => {
      const result = buildSpeakableContent(
        {
          content: [block('Erster.'), { _type: 'divider' }, block('Zweiter.')],
        },
        'voice-a',
      )
      const durations = pauseDurations(result)
      expect(durations[durations.length - 1]).toBe(1.4)
    })

    it('gives a heading 1.4s pauses on both sides and tags it role "subtitle"', () => {
      const result = buildSpeakableContent(
        {
          content: [
            block('Erster.'),
            block('Zwischentitel', 'heading'),
            block('Zweiter.'),
          ],
        },
        'voice-a',
      )
      const items = paragraphs(result)
      expect(items).toEqual(
        expect.arrayContaining([{ role: 'subtitle', text: 'Zwischentitel.' }]),
      )
      const durations = pauseDurations(result)
      // both pauses flanking the heading are heavy
      expect(durations.slice(-2)).toEqual([1.4, 1.4])
    })

    it('tags an interviewQuestion block role "question"', () => {
      const result = buildSpeakableContent(
        {
          content: [
            block('Was denken Sie?', 'interviewQuestion'),
            block('Nun ja...'),
          ],
        },
        'voice-a',
      )
      expect(paragraphs(result)).toEqual(
        expect.arrayContaining([{ role: 'question', text: 'Was denken Sie?' }]),
      )
    })
  })

  describe('chapter markers (opt-in)', () => {
    it('emits a marker node immediately before a heading paragraph when enabled', () => {
      const result = buildSpeakableContent(
        { content: [block('Erster.'), block('Zwischentitel', 'heading')] },
        'voice-a',
        { chapterMarkers: true },
      ) as any[]
      const markerIndex = result.findIndex((n) => n.type === 'marker')
      expect(markerIndex).toBeGreaterThan(-1)
      expect(result[markerIndex].attrs.label).toBe('Zwischentitel')
      expect(result[markerIndex + 1]?.attrs?.meta?.role).toBe('subtitle')
    })

    it('emits no marker nodes when the option is omitted', () => {
      const result = buildSpeakableContent(
        { content: [block('Erster.'), block('Zwischentitel', 'heading')] },
        'voice-a',
      ) as any[]
      expect(result.some((n) => n.type === 'marker')).toBe(false)
    })
  })

  describe('voiceTag (per-speaker voice switching)', () => {
    it('splits a block into separate paragraphs per voice, with no pause between them', () => {
      const result = buildSpeakableContent(
        {
          content: [
            {
              _type: 'block',
              style: 'normal',
              children: [
                { _type: 'span', text: 'Frage? ' },
                { _type: 'voiceTag', voice: 'voice-b' },
                { _type: 'span', text: 'Antwort.' },
              ],
            },
          ],
        },
        'voice-a',
      ) as any[]
      // exclude the always-present credits notice paragraph — only the two
      // segments produced by splitting this one block are of interest here.
      const paras = result.filter(
        (n) => n.type === 'paragraph' && n.attrs.meta.role === 'paragraph',
      )
      expect(paras.map((p) => p.attrs.voiceName)).toEqual([
        'voice-a',
        'voice-b',
      ])
      expect(paras.map((p) => p.content[0].text)).toEqual([
        'Frage?',
        'Antwort.',
      ])
      // no pause node between the two paragraphs produced by the same block
      const between = result.slice(
        result.indexOf(paras[0]) + 1,
        result.indexOf(paras[1]),
      )
      expect(between.some((n) => n.type === 'pause')).toBe(false)
    })
  })

  describe('blockQuote', () => {
    const quote = (body: unknown[], caption?: unknown) => ({
      _type: 'blockQuote',
      body,
      ...(caption ? { caption } : {}),
    })

    it('speaks the quote body and its caption.legend as attribution, bracketed by heavy pauses', () => {
      const result = buildSpeakableContent(
        {
          content: [
            block('Vorher.'),
            quote([block('Ein Zitat.')], {
              legend: portableText('Albert Einstein'),
            }),
            block('Nachher.'),
          ],
        },
        'voice-a',
      )
      expect(paragraphs(result)).toEqual(
        expect.arrayContaining([
          { role: 'quote', text: 'Ein Zitat.' },
          { role: 'quote-attribution', text: 'Albert Einstein.' },
        ]),
      )
    })

    it('falls back to caption.credit when legend is absent', () => {
      const result = buildSpeakableContent(
        {
          content: [
            quote([block('Ein Zitat.')], {
              credit: portableText('Bildarchiv'),
            }),
          ],
        },
        'voice-a',
      )
      expect(paragraphs(result)).toEqual(
        expect.arrayContaining([
          { role: 'quote-attribution', text: 'Bildarchiv.' },
        ]),
      )
    })

    it('omits the attribution paragraph when there is no caption', () => {
      const result = buildSpeakableContent(
        { content: [quote([block('Ein Zitat.')])] },
        'voice-a',
      )
      expect(
        paragraphs(result).some((p) => p.role === 'quote-attribution'),
      ).toBe(false)
    })

    it('produces a single pause where its closing boundary meets a real divider', () => {
      const result = buildSpeakableContent(
        {
          content: [
            block('Vorher.'),
            quote([block('Ein Zitat.')]),
            { _type: 'divider' },
            block('Nachher.'),
          ],
        },
        'voice-a',
      ) as any[]
      const quoteIndex = result.findIndex(
        (n) => n.content?.[0]?.text === 'Ein Zitat.',
      )
      const afterIndex = result.findIndex(
        (n) => n.content?.[0]?.text === 'Nachher.',
      )
      expect(
        result
          .slice(quoteIndex + 1, afterIndex)
          .filter((n) => n.type === 'pause'),
      ).toHaveLength(1)
    })

    it('is dropped entirely when its body is empty', () => {
      const result = buildSpeakableContent(
        { content: [quote([]), block('Absatz.')] },
        'voice-a',
      )
      expect(paragraphs(result).some((p) => p.role === 'quote')).toBe(false)
    })
  })

  describe('pullQuote', () => {
    it('speaks text and source (both plain strings, not portable text)', () => {
      const result = buildSpeakableContent(
        {
          content: [
            {
              _type: 'pullQuote',
              text: 'Ein herausgehobenes Zitat.',
              source: 'Die Quelle',
            },
          ],
        },
        'voice-a',
      )
      expect(paragraphs(result)).toEqual(
        expect.arrayContaining([
          { role: 'pullquote', text: 'Ein herausgehobenes Zitat.' },
          { role: 'pullquote-source', text: 'Die Quelle.' },
        ]),
      )
    })

    it('is dropped entirely when text is empty, even if source is set', () => {
      const result = buildSpeakableContent(
        {
          content: [
            { _type: 'pullQuote', text: '', source: 'Die Quelle' },
            block('Absatz.'),
          ],
        },
        'voice-a',
      )
      const roles = paragraphs(result).map((p) => p.role)
      expect(roles).not.toContain('pullquote')
      expect(roles).not.toContain('pullquote-source')
    })
  })

  describe('infoBox', () => {
    it('speaks title then body when opted in', () => {
      const result = buildSpeakableContent(
        {
          content: [
            {
              _type: 'infoBox',
              includeInSyntheticVoice: true,
              title: 'Zum Hintergrund',
              body: [block('Kasteninhalt.')],
            },
          ],
        },
        'voice-a',
      )
      expect(paragraphs(result)).toEqual(
        expect.arrayContaining([
          { role: 'aside', text: 'Zum Hintergrund.' },
          { role: 'aside', text: 'Kasteninhalt.' },
        ]),
      )
    })

    it('still includes the title when body is empty and opted in', () => {
      const result = buildSpeakableContent(
        {
          content: [
            {
              _type: 'infoBox',
              includeInSyntheticVoice: true,
              title: 'Nur ein Titel',
              body: [],
            },
          ],
        },
        'voice-a',
      )
      expect(paragraphs(result)).toEqual(
        expect.arrayContaining([{ role: 'aside', text: 'Nur ein Titel.' }]),
      )
    })

    it('is dropped entirely when not opted in, regardless of content', () => {
      const result = buildSpeakableContent(
        {
          content: [
            {
              _type: 'infoBox',
              title: 'Zum Hintergrund',
              body: [block('Kasteninhalt.')],
            },
            {
              _type: 'infoBox',
              includeInSyntheticVoice: false,
              title: 'Auch nicht',
              body: [block('Auch nicht.')],
            },
            block('Absatz.'),
          ],
        },
        'voice-a',
      )
      expect(paragraphs(result).some((p) => p.role.startsWith('aside'))).toBe(
        false,
      )
    })

    it('is dropped entirely when both title and body are empty', () => {
      const result = buildSpeakableContent(
        {
          content: [
            { _type: 'infoBox', includeInSyntheticVoice: true, body: [] },
            block('Absatz.'),
          ],
        },
        'voice-a',
      )
      expect(paragraphs(result).some((p) => p.role.startsWith('aside'))).toBe(
        false,
      )
    })
  })

  it('splices webOnly content in transparently, with no framing/role change', () => {
    const result = buildSpeakableContent(
      {
        content: [{ _type: 'webOnly', body: [block('Nur im Web.')] }],
      },
      'voice-a',
    )
    expect(paragraphs(result)).toEqual(
      expect.arrayContaining([{ role: 'paragraph', text: 'Nur im Web.' }]),
    )
  })

  describe('email-only exclusions', () => {
    const forbidden = 'SOLLTE NICHT ERSCHEINEN'

    it.each([
      ['emailOnly', { _type: 'emailOnly', body: [block(forbidden)] }],
      ['if', { _type: 'if', present: 'hasAccess', body: [block(forbidden)] }],
      [
        'ifNot',
        { _type: 'ifNot', present: 'hasAccess', body: [block(forbidden)] },
      ],
    ])(
      'excludes %s content entirely — it never renders on the web article',
      (_name, node) => {
        const result = buildSpeakableContent(
          { content: [block('Absatz.'), node] },
          'voice-a',
        )
        const allText = paragraphs(result)
          .map((p) => p.text)
          .join(' ')
        expect(allText).not.toContain(forbidden)
      },
    )
  })

  it('silently skips node types with no narratable representation (e.g. an embed)', () => {
    const result = buildSpeakableContent(
      {
        content: [
          block('Absatz.'),
          { _type: 'embedVideo', url: 'https://example.com/video' },
        ],
      },
      'voice-a',
    )
    // doesn't throw, and produces no paragraph for the embed (ignoring the
    // always-present credits notice paragraph, which isn't what's under test)
    expect(
      paragraphs(result)
        .filter((p) => p.role !== 'credits')
        .map((p) => p.text),
    ).toEqual(['Absatz.'])
  })
})

describe('plainText / plainTitle', () => {
  it('plainText flattens portable text to a trimmed string', () => {
    expect(plainText(portableText('  Hallo Welt  '))).toBe('Hallo Welt')
  })

  it('plainText strips soft hyphens and invisible separators', () => {
    expect(plainText(portableText('Bundes­rat⁣'))).toBe('Bundesrat')
  })

  it('plainText removes parenthetical asides without leaving double spaces', () => {
    expect(
      plainText(portableText('Der Bundesrat (also die Regierung) entscheidet')),
    ).toBe('Der Bundesrat entscheidet')
  })

  it('plainText returns an empty string for nullish input', () => {
    expect(plainText(undefined)).toBe('')
    expect(plainText(null)).toBe('')
  })

  it('plainTitle falls back to "Ohne Titel" when there is no title', () => {
    expect(plainTitle(undefined)).toBe('Ohne Titel')
  })

  it('plainTitle returns the flattened title when present', () => {
    expect(plainTitle(portableText('Mein Titel'))).toBe('Mein Titel')
  })
})
