### Bugs

- Links: 
  - autolinking gets out of sync when the link is edited (onChange should also change text)
  - shorten link text? (like BE would)

```react
state: {
    value: [
    {
      type: 'flyerTileOpening',
      children: [
        {
          type: 'flyerDate',
          children: [{ text: '' }],
          ...date,
        },
        {
          type: 'headline',
          children: [
            { text: 'Guten Morgen.' },
            { type: 'break', children: [{ text: '' }] },
            { text: 'Schön, sind Sie da!' },
          ],
        },
      ],
    },
    {
      type: 'flyerTile',
      id: '4',
      children: [
        {
          type: 'flyerMetaP',
          children: [
            {
              text: 'Ausserdem hören Sie heute in der Republik die letzte Sprachnotiz von Nicoletta Cimmino. ',
            },
            {
              type: 'link',
              children: [{ text: 'Sie handelt vom Abschied­nehmen.' }],
            },
            {
              text: ' Und weshalb man das manchmal früher als erhofft tun muss.',
            },
          ],
        },
        {
          type: 'flyerTopic',
          children: [{ text: 'Im Dialog' }],
        },
        {
          type: 'flyerTitle',
          children: [
            {
              text: 'Which Kolumne do you miss?',
            },
          ],
        },
        {
          type: 'flyerAuthor',
          authorId: '123',
          children: [{ text: '' }],
        },
        {
          type: 'flyerAuthor',
          authorId: '456',
          children: [{ text: '' }],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: 'Some of us miss Sybille Berg.',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: 'Others will miss Nicoletta Cimino.',
            },
          ],
        },
        {
          type: 'pullQuote',
          children: [
            {
              type: 'pullQuoteText',
              children: [{ text: 'Che tristezza, Nicoletta.' }],
            },
            {
              type: 'pullQuoteSource',
              children: [
                { text: 'Zum Beitrag: ' },
                { type: 'link', children: [{ text: 'Abschiednehmen' }] },
                { text: '.' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'flyerTileClosing',
      children: [
        {
          type: 'headline',
          children: [{ text: 'Danke fürs Interesse.' }],
        },
        {
          type: 'flyerSignature',
          children: [
            {
              text: 'Ihre Crew der Republik',
            },
          ],
        },
      ],
    },
  ],
    structure: [
        {
            type: 'flyerTileOpening',
        },
        {
            type: ['flyerTile', 'flyerTileMeta'],
            repeat: true
        },
        {
            type: 'flyerTileClosing',
        },
    ]
}
---
<Editor
    value={state.value}
    setValue={(newValue) => {
        setState({value: newValue})
    }}
   
    config={{ debug: true, schema, editorSchema, structure: state.structure, context: { t } }}
/>
```

## Rendering

```react
<SlateRender value={exampleTree} schema={schema} />
```
