```react
state: {
    value: [
        {
           type: 'paragraph',
           children: [{ text: '' }]
        }
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
<SlateRender value={tree1} schema={schemaFlyer} />
```
