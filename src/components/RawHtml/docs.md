The `RawHtml` component allows to (dangerously) render raw HTML with styleguide-compliant typography. Typical use cases are links and `<br />` tags inside translation strings.

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

```react|span-6
<RawHtml
  black
  type={Interaction.H1}
  dangerouslySetInnerHTML={{
    __html: '<b>Bold</b> und <a href="#">Link</a>'
  }}
/>
```

```react|span-6
<RawHtml
  white
  type={Interaction.H1}
  dangerouslySetInnerHTML={{
    __html: '<b>Bold</b> und <a href="#">Link</a>'
  }}
/>
```

```react|span-6
<RawHtml
  error
  type={Interaction.H1}
  dangerouslySetInnerHTML={{
    __html: 'Error and <a href="#">Link</a>'
  }}
/>
```
