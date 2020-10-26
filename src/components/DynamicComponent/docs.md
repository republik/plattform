```react
<div>
  Hello from the
  <DynamicComponent
    src='/static/dynamic_hello.js'
    loaderProps={{message: 'Loading…'}} />
</div>
```

The `src` prop needs to point to a `d3-require` compatible module (strict subset of AMD) exporting a React component. The component will be lazy loaded on the client.

You can generate such a module bundle with rollup:
```
rollup source.js --file build.js --format amd --external react,prop-types,glamor,@project-r/styleguide
```

By default modules can only be loaded from relative or absolute paths. Following dependencies are always provided and can be excluded from the module bundle:
- `react`
- `prop-types`
- `glamor`
- `@project-r/styleguide` (everything exposed in `lib.js`)
- `@project-r/styleguide/chart` (everything exposed in `chart.js`)

Set a `SG_DYNAMIC_COMPONENT_BASE_URLS` environment variable with comma-separated base urls to allow CDN hosts.

You may also pass a custom `require` function as a prop with additional provided dependencies or custom allow list logic. A `createRequire(allowList)` utility is available to extend the default.

## SSR

Currently server-side rendering is not supported. But you may provide static html via the `html` prop for SSR.

### Loader

If no html is provided a `<Loader loading />` will be rendered until the script is ready. You can pass props to that loader via the `loaderProps` prop. 

## Props for the Component

You can pass props to the dynamic component via the `props` prop.

```react
<DynamicComponent
  src='/static/dynamic_hello.js'
  props={{text: 'Hi there!'}} />
```

## Identifier-based Component

Alternately, you can specify an `identifier` instead of a `src`. This identifier is then mapped to a specific component in the frontend. Use a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) if you want to catch all, e.g. for displaying a placeholder in a CMS.

Currently supported identifiers:

- `VOTEBOX`: points to the voting component of the general assembly

Props can be passed to the component same as described above. 
