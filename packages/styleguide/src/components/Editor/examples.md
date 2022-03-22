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
            type: ['paragraph', 'pullQuote', 'figure', 'list'],
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
