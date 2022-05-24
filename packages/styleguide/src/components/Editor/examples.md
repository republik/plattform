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
            type: ['paragraph', 'ul', 'ol', 'figure', 'blockQuote'],
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
    config={{ maxSigns: 3000, schema: 'article' }}
/>
```

## Read-only Rendering

```react
<SlateRender value={tree1} schema='article' />
```