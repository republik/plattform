Utility hook passing the height of the header to its children by way of a context payload. Additionally

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

<HeaderHeightProvider config={[{ minWidth: 0, headerHeight: 30 }]}>
  <Child />
</HeaderHeightProvider>
```
