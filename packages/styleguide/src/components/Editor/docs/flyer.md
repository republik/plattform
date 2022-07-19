### Todos

- Create new tile
- different render in editor and outside (e.g. for link)
- New elements/real elements/forms for elements
    - Chart
    - Quiz
    - Survey
- Copy from HTML (nice to have)
- Flyer Tile Form

- Authors editor (single tile)

### Bugs

- Copy title with break swallows the break


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
    config={{ debug: true, schema: schemaFlyer }}
/>
```

## Rendering

```react
<SlateRender value={exampleTree} schema={schemaFlyer} />
```
