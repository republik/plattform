`<Center />` defines a max-width and ensures a horizontal padding.

`<Breakout />` allows to adjust `size` (and positioning) of its content:
- `regular` (default)
- `narrow`
- `tiny`
- `breakout`
- `breakoutLeft`
- `float`
- `floatSmall`
- `floatTiny`

```react
<Center style={{backgroundColor: 'red'}}>
  <Breakout size={'regular'} style={{backgroundColor: 'darkgreen', height: 20}}>
  </Breakout>
</Center>
```

```react
<Center style={{backgroundColor: 'red'}}>
  <Breakout size={'narrow'} style={{backgroundColor: 'darkgreen', height: 20}}>
  </Breakout>
</Center>
```

```react
<Center style={{backgroundColor: 'red'}}>
  <Breakout size={'tiny'} style={{backgroundColor: 'darkgreen', height: 20}}>
  </Breakout>
</Center>
```

```react
<Center style={{backgroundColor: 'red'}}>
  <Breakout size={'breakout'} style={{backgroundColor: 'darkgreen', height: 20}}>
  </Breakout>
</Center>
```

```react
<Center style={{backgroundColor: 'red'}}>
  <Breakout size={'breakoutLeft'} style={{backgroundColor: 'darkgreen', height: 20}}>
  </Breakout>
</Center>
```

```react
<Center style={{backgroundColor: 'red'}}>
  <Breakout size={'float'} style={{backgroundColor: 'darkgreen', height: 20}}>
  </Breakout>
</Center>
```

```react
<Center style={{backgroundColor: 'red'}}>
  <Breakout size={'floatSmall'} style={{backgroundColor: 'darkgreen', height: 20}}>
  </Breakout>
</Center>
```

```react
<Center style={{backgroundColor: 'red'}}>
  <Breakout size={'floatTiny'} style={{backgroundColor: 'darkgreen', height: 20}}>
  </Breakout>
</Center>
```
