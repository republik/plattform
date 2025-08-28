Utility hook passing the height of the header to its children by way of a context payload.

Example using the `headerHeight` value programmatically:

```react
const Child = () => {

  const headerHeight = useHeaderHeight()

  return (
    <div style={{paddingTop: headerHeight}}>
      Lorem ipsum dolor sit amet.
    </div>
  )
}

<HeaderHeightProvider height={height: SOME_DYNAMIC_HEIGHT_VALUE}>
  <Child />
</HeaderHeightProvider>
```
