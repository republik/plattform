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
