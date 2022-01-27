Props:
- `label`: string, the label of the tag.
- `count`: optional number, the count.
- `color`: optional string, the color of the label.

```react
<FormatTag
  label='Aus der Redaktion'
  count={17}
  color='#008899'
/>
```

```react
<FormatTag
  label='Aus der Redaktion'
  count={17}
/>
```

```react
<FormatTag
  label='Aus der Redaktion'
/>
```

```react
<div>
  <FormatTag
    label='Aus der Redaktion'
    count={9}
    color='#008899'
  />
  <FormatTag
    label='Hinter den Kulissen'
    count={17}
    color='#aa6600'
  />
  <FormatTag
    label='Am Ereignishorizont'
    count={12}
    color='#dc2543'
  />
  <FormatTag
    label='Auf der Bühne'
    count={28}
    color='#8B008B'
  />
  <FormatTag
    label='Weltgeschehen'
    count={87}
    color='#0359ae'
  />
</div>
```
