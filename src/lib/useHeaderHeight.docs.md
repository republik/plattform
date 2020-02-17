Utility hook passing the height of the header to its children by way of a context payload. Additionally, a list of media queries is provided to generate CSS rules.

The hook requires a `HeaderHeightProvider` instance configured with a list of breakpoints (`minWidth`) and and height values (`headerHeight`) .

Example using the `headerHeight` value programmatically:

```react
const Child = () => {

  const [ headerHeight ] = useHeaderHeight()

  return (
    <div style={{paddingTop: headerHeight}}>
      Lorem ipsum dolor sit amet.
    </div>
  )
}

<HeaderHeightProvider config={[{ minWidth: 0, headerHeight: 30 }]}>
  <Child />
</HeaderHeightProvider>
```

Example using the `mediaQuery`/`value` pairs to generate CSS:

```react
const Child = () => {

  const [ _, rules ] = useHeaderHeight()

  const style = css(rules.reduce((acc, { mediaQuery, headerHeight }) => 
    Object.assign(
      acc, 
      {[mediaQuery]: {paddingTop: headerHeight}}
    ), {})
  )

  return (
    <div {...style}>
      Lorem ipsum dolor sit amet.
    </div>
  )
}

<HeaderHeightProvider config={[{ minWidth: 0, headerHeight: 30 }]}>
  <Child />
</HeaderHeightProvider>
```

