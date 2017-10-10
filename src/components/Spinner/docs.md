## Spinner

The `Spinner` has `position:absolute` at 50% / 50%. It is therefore taken out of the page flow, so make sure to put an appropriately-sized container around it.

The only props the spinner accepts is `size` – the width/height of the spinner.

```react|span-3
<div style={{height: 100}}>
  <Spinner />
</div>
```
```react|span-3
<div style={{height: 100}}>
  <Spinner size={80} />
</div>
```

## InlineSpinner

The `InlineSpinner` wraps a `Spinner` in a correctly-sized `inline-block` element.

It accepts the same props as `Spinner`.

```react|span-3
<InlineSpinner />
```

```react|span-3
<InlineSpinner size={80} />
```
