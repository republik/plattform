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
    config={{ maxSigns: 120, schema: schemaComment }}
/>
```

## Read-only Rendering

#### Article

```react
<SlateRender value={tree1} schema={schemaArticle} />
```

#### Comment (Web)

```react
<SlateRender value={tree1} schema={schemaComment} />
```

#### Comment (Email)

```react
<SlateRender value={tree1} schema={schemaCommentEmail} />
```