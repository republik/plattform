# Modules

## Embed

Markdown representation

```
<section><h6>EMBED</h6>

  <Embed Url>

<hr /></section>
```

Slate structure:

```
{
  kind: 'block',
  type: string, dynamic type
  data: {
    url
  },
  isVoid: true
}
```

Example Template config:

```
{
  matchMdast: matchZone(
    'EMBED'
  ),
  component: ({ data }) => (
    <pre
      style={{lineHeight: '1em'}}
    >
      {JSON.stringify(data, null, 3)}
    </pre>
  ),
  editorModule: 'embed',
  editorOptions: {
    lookupType: 'paragraph'
  }
}
```

The editor option `lookupType` points at the block, which should get checked for embed urls.
