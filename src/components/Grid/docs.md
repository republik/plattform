## Containers

Container definieren die maximale Breite des Grids und kümmeren sich um das horizontale Padding zum Rand.

```react
<Container>…</Container>
```

## Grid & Spans

Je nach verfügbarer Fläche nutzen wir ein zwei oder sechs Spalten Grid.

### Props

- `s` Span width for small sizes. Fractions of 2, e.g. `1/2`
- `m` Span width for medium up. Fractions of 6, e.g. `5/6`

```hint
`<Span>` must be nested in `<Grid>`
```

```react
<Grid>
  <Span s='1/2' m='2/6'>Foo</Span>
  <Span s='1/2' m='4/6'>Bar</Span>
</Grid>
```