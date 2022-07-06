### Todos

- Switch block type when nested (feature kinda-sorta worked, then got "forgotten" for community editor)
- Tile UI
    - move up/down
    - delete
    - edit meta
    - import from list
- Create new tile
- New elements
    - Chart
    - Quiz
    - Survey
- Copy from HTML

### Bugs

- Enter on empty Meta P in opening tile -> should create new tile
- Copy title with break swallows the break
- Convert P <-> List doesn't work
- Convert punchline <-> image <-> article preview <-> etc. doesn't work


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
            type: 'flyerTile',
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
