## Editor

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
            type: 'headline'
        },
        {
            type: ['paragraph', 'ul', 'ol', 'blockQuote'],
            repeat: true
        }
    ]
}
---
<Editor
    value={state.value}
    setValue={(newValue) => {
        setState({value: newValue})
    }}
    structure={state.structure}
/>
```

## Read-only Rendering

```react
<SlateRender value={tree1} />
```