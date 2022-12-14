```code|lang-js
import {
  ColorContextProvider,
  useColorContext
} from '@project-r/styleguide'
```


Add a root color context provider, e.g. in your frame component:

```react
<ColorContextProvider root colorSchemeKey='auto'>
  <Editorial.Headline>Let the Human decide.</Editorial.Headline>
</ColorContextProvider>
```

`auto` respects OS preference via media query `@media (prefers-color-scheme: dark)` and user preferences via a html data attribute `html[data-user-color-scheme="dark"]`. The `root` provider renders a style tag with CSS variable definitions and global CSS rules for `html` and `body`—setting `backgroundColor` and `color`.

Force dark mode:

```react|dark
<ColorContextProvider root colorSchemeKey='dark'>
  <Editorial.Headline>Always dark.</Editorial.Headline>
</ColorContextProvider>
```

Be careful with this one: democracy dies in darkness.

You may also only force a section within your React tree by using nested `ColorContextProvider` without the root flag:

```react
<ColorContextProvider root colorSchemeKey='auto'>
  <Editorial.Headline>Auto</Editorial.Headline>
  <ColorContextProvider colorSchemeKey='dark'>
    <Container>
      <Editorial.Subhead>Dark</Editorial.Subhead>
    </Container>
  </ColorContextProvider>
</ColorContextProvider>
```

## Using the Context

```
colorScheme.set(attr, color, [mappingName]): rule
colorScheme.getCSSColor(color, [mappingName]): string[]|string
```

- `attr`: string, the css attribute, e.g. `'backgroundColor'`, `'color'` or `'borderColor'`
- `color`: string, the variable name, e.g. `'default'` or `'text'`, for convenience you may also pass literal values (`'#000'`) and css color arrays (`['#000', 'var(--color-text)']`)
- `mappingName`: string, optional, use a predefined map to transform `color` to a variable or different literal value, e.g. `'format'`

`colorScheme.set` returns a glamor rule (like glamors `css`) which should be spread onto a React element.

`colorScheme.getCSSColor` returns CSS values (array of string or just a string) which should be used as a CSS attribute value within a CSS rule.

### `colorScheme.set`

```code|lang-js
const Container = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...colorScheme.set('backgroundColor', 'default')}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </div>
  )
}
```

### Custom Rules

Need to target a pseudo selector? Or nest something in a media query? You may use the `getCSSColor` helper to create a custom rule. Make sure to `useMemo`:

```code|lang-js
const A = ({ children }) => {
  const hoverRule = useMemo(
    () => css({
      '@media (hover)': {
        ':hover': {
          color: colorScheme.getCSSColor('hover')
        }
      }
    }),
    [colorScheme]
  )

  return <a {...hoverRule}>{children}</a>
}
```

The color coming in via prop and needing a mapping:

```code|lang-js
const A = ({ formatColor, children }) => {
  const hoverRule = useMemo(
    () => css({
      '@media (hover)': {
        ':hover': {
          color: colorScheme.getCSSColor(formatColor, 'format')
        }
      }
    }),
    [colorScheme, formatColor]
  )

  return <a {...hoverRule}>{children}</a>
}
```

### Tips

#### Avoid Short Hands

```code|lang-js
<div
  {...colorScheme.set('borderColor', 'divider')}
  style={{ borderTop: '1px solid' }}>
</div>
```

`borderTop` sets a default #000 color and style wins over the CSS rule.

Use `borderTopWidth` and `borderTopStyle` instead:

```code|lang-js
<div
  {...colorScheme.set('borderColor', 'divider')}
  style={{ borderTopWidth: 1, borderTopStyle: 'solid' }}>
</div>
```

#### Avoid Custom Elements

```code|lang-js
<Interaction.P {...colorScheme.set('color', 'error')}>
  May or may not be red.
</Interaction.P>
```

Even when a component forwards props to its nativ element it might already have a different color rule which most likely has the same specificity.

Instead use a native `span` to set your color:

```code|lang-js
<Interaction.P>
  <span {...colorScheme.set('color', 'error')}>
    Will always be red.
  </span>
</Interaction.P>
```

Notable exceptions: setting fill on icons. We'll ensure that our icon components always support setting a `fill` via `colorScheme.set` from the outside.

## Local Extensions

E.g. for charts. Default local colors: inverted colors.

```react
<ColorContextLocalExtension localColors={{
  light: {
    chart1: '#007fff'
  },
  dark: {
    chart1: '#ff0099'
  }
}} localMappings={{
  charts: {
    '#007fff': 'chart1'
  }
}}>
  <GetColorScheme>
    {(colorScheme) => <>
      <div
        {...colorScheme.set('backgroundColor', 'chart1')}
        style={{
          width: 40,
          height: 20
        }} />
      <div
        {...colorScheme.set('backgroundColor', '#007fff', 'charts')}
        style={{
          width: 40,
          height: 20
        }} />
    </>}
  </GetColorScheme>
</ColorContextLocalExtension>
```

```react|span-3,dark
<ColorContextProvider colorSchemeKey='dark'>
<ColorContextLocalExtension localColors={{
  light: {
    chart1: '#007fff'
  },
  dark: {
    chart1: '#ff0099'
  }
}} localMappings={{
  charts: {
    '#007fff': 'chart1'
  }
}}>
  <GetColorScheme>
    {(colorScheme) => <>
      <div
        {...colorScheme.set('backgroundColor', 'chart1')}
        style={{
          width: 40,
          height: 20
        }} />
      <div
        {...colorScheme.set('backgroundColor', '#007fff', 'charts')}
        style={{
          width: 40,
          height: 20
        }} />
    </>}
  </GetColorScheme>
</ColorContextLocalExtension>
</ColorContextProvider>
```

```react|span-3
<ColorContextProvider colorSchemeKey='light'>
<ColorContextLocalExtension localColors={{
  light: {
    chart1: '#007fff'
  },
  dark: {
    chart1: '#ff0099'
  }
}} localMappings={{
  charts: {
    '#007fff': 'chart1'
  }
}}>
  <GetColorScheme>
    {(colorScheme) => <>
      <div
        {...colorScheme.set('backgroundColor', 'chart1')}
        style={{
          width: 40,
          height: 20
        }} />
      <div
        {...colorScheme.set('backgroundColor', '#007fff', 'charts')}
        style={{
          width: 40,
          height: 20
        }} />
    </>}
  </GetColorScheme>
</ColorContextLocalExtension>
</ColorContextProvider>
```

