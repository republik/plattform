### `<LazyLoad />`

Awaits the viewport approaching to render its children. It works by rendering a span wrapper which should act as an placeholder—reserving the right amount of space. When `!process.browser` the children will be rendered in a `<noscript>` tag before being visible.

#### Properties

- `visible` bool, overwrite laziness—e.g. server rendered first items
- `offset` number, default 0.5, distance in viewport height to start rendering
- `style` object, applied to wrapper
- `attributes` object, spread onto the wrapper
- `children` node, the lazy loaded content

### `<LazyImage />`

A convenience wrapper for width filling images with an known aspect ratio. It takes care of the placeholder.

#### Properties

- `aspectRatio`, number, `width/height`
- forwards `offset`, `visible`, `attributes` to `<LazyLoad />`
- forwards `src`, `srcSet`, `alt`, `sizes` to an `<img />`

#### Example

```react
<div>
  <P style={{paddingBottom: '150vh'}}>
    By default a LazyLoad wrapped component will only load once it's half the screen height away. There is an image below, in 1.5 screen heights:
  </P>
  <LazyLoad style={{
    display: 'block',
    position: 'relative',
    paddingBottom: `${100 / (2000 / 1411)}%`,
    backgroundColor: 'rgba(0,0,0,0.1)'
  }}>
    <img src='/static/landscape.jpg?size=2000x1411' style={{
      display: 'block',
      position: 'absolute',
      width: '100%'
    }} />
  </LazyLoad>
  <P style={{paddingTop: 50, paddingBottom: '100vh'}}>
    There is another image below, in 1 screen heights:
  </P>
  <LazyImage src='/static/rothaus_landscape.jpg?size=2000x1331' aspectRatio={2000/1331} />
  <P style={{paddingTop: 50, paddingBottom: '100vh'}}>
    And another image with custom constraints, in 1 screen heights:
  </P>
  <div style={{height: 200}}>
    <LazyLoad>
      <img src='/static/rothaus_portrait.jpg?size=945x1331' style={{
        maxWidth: 200,
        maxHeight: 200
      }} />
    </LazyLoad>
  </div>
</div>
```
