### Todos

- block UI scroll while moving element
- New elements/real elements/forms for elements
    - Chart
    - Survey
- Copy from HTML (nice to have)
- Authors editor (single block)

### Bugs

- Copy title with break swallows the break
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
            type: 'headline',
            children: [
              { text: 'Guten Morgen,' },
              { type: 'break', children: [{ text: '' }] },
              { text: 'schoen sind Sie da!' },
            ],
          },
        ],
      },
      {
        type: 'flyerTileClosing',
        children: [
          {
            type: 'headline',
            children: [{ text: 'Bis nachher!' }],
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
    structure={state.structure}
    config={{ debug: true, schema, editorSchema }}
/>
```

## Rendering

```react
<SlateRender value={exampleTree} schema={schema} />
```
