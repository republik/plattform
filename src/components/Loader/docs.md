The `Loader` is an convenience component to help with data loading.

You can directly map Apollo Client query result to it.

```code|lang-jsx
const query = gql`query { me { name } }`

graphql(query)(({data: {loading, error, me}}) => (
  <Loader loading={loading} error={error} render={() => {
    const {name} = me
    return <H1>{name}</H1>
  }} />
))
```

This enables us to easily handle all states and errors.

The loader displays the `Spinner` component if loading takes longer than `delay` (default 500ms). You can optionally pass an `message` to be displayed along the `Spinner`.

If `error` is truthy, it is converted to string and and displayed in red.

Once the data has been loaded and we're errorless—the `render` function is called and returned as children.

## The Four Main States

```react|span-3
<Loader
  loading={true}
  render={() => <P>Content loaded</P>} />
```

```react|span-3
<Loader
  loading={true}
  message={'Loading…'}
  render={() => <P>Content loaded</P>} />
```

```react|span-3
<Loader
  error={'An error has occured'}
  render={() => <P>Content loaded</P>} />
```

```react|span-3
<Loader
  loading={false}
  render={() => <P>Content loaded</P>} />
```

## Size

The loader is designed to fill out the space given while loading.

This is done with an `div` with:
- `min-width: 100%`
- `min-height: 120px` (enough space for the spinner and a message)
- `height: 100%`.

```react|span-3
<Loader loading />
```

```react|span-3
<div style={{height: 200}}>
  <Loader loading />
</div>
```

You can overwrite those default by providing an `style` object.

For example if you load an whole page you could use an min height definition like `calc(100vh - 80px)` (viewport height minus header).

```code|lang-jsx
<Loader loading style={{minHeight: 'calc(100vh - 80px)'}} />
```

Once loading has concluded or an error occurs `Loader` does not longer render an intermediate `div` and `style` has no effect.

### Error Container

If you want to display data based edge-to-edge content you'll have no container around `Loader`. You will render containers within your `render` function.

However if now an error occurs you'll end up with a padding-less error message at your window edge. To avoid this pass an `ErrorContainer`:

```react|responsive
<Loader
  height='calc(100vh - 80px)'
  error='This is a nice error message. Please avoid edge-to-edge error messages please.'
  ErrorContainer={NarrowContainer} />
```
