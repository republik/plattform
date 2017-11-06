The `RawHtml` component allows to (dangerously) render raw HTML.

By default the HTML is rendered inside a `<span>` element. The `type` property can be either a tag name string (such as 'div' or 'h1'), or a React component type.

```react|span-6
<RawHtml
  dangerouslySetInnerHTML={{
    __html: '<b>Bold</b> und <a href="#">Link</a>'
  }}
/>
```

```react|span-6
<RawHtml
  type={'h1'}
  dangerouslySetInnerHTML={{
    __html: '<b>Bold</b> und <a href="#">Link</a>'
  }}
/>
```

```react|span-6
<RawHtml
  type={Interaction.H1}
  dangerouslySetInnerHTML={{
    __html: '<b>Bold</b> und <a href="#">Link</a>'
  }}
/>
```
