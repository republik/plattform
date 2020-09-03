## IconButton

A clickable component that accepts icons and lables and renders them. If href is provided, the component renders an `<a>` element, else it renders a `<button>`.

- `Icon`: A React icon component
- `title`: Title (shown on hover)
- `label`: Default label (optional)
- `labelShort`: Label that is shown on mobile devices
- `fill`: Fill for icon and text, default is *color.text*
- `onClick`: onClick function. If either onClick or href are provided, the IconButton applies a hover style.
- `href`: if href is provided, IconButton renders as `<a>`
- `target`: target for href
- `children`: renders children after label
- `style`: allows to overwrite styles on the top component

```react|responsive
<div style={{display:'flex'}}>
  <IconButton
    title="Lesezeichen"
    Icon={Icons.Bookmark}
    onClick={() => alert("click")}
  />
  <IconButton
    Icon={Icons.Bookmark}
    title="Lesezeichen"
    label="Lesezeichen"
  />
    <IconButton
    Icon={Icons.Bookmark}
    title="Lesezeichen"
    label="Ihre Lesezeichen"
    labelShort="LZ"
  />
</div>
```