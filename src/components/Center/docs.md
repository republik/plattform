`<Center />` defines a max-width and ensures a horizontal padding.

`<Breakout />` allows to adjust `size` (and positioning) of its content:
- `undefined` (default, do nothing)
- `narrow`
- `tiny`
- `breakout`
- `breakoutLeft`
- `float`
- `floatSmall`
- `floatTiny`

```react|responsive
<div>
  <Center style={{backgroundColor: 'red', 'marginBottom': '20px'}}>
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</p>
    <Breakout style={{backgroundColor: 'darkgreen', height: 20}} />
  </Center>
  <Center style={{backgroundColor: 'red', 'marginBottom': '20px'}}>
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</p>
    <Breakout size='narrow' style={{backgroundColor: 'darkgreen', height: 20}} />
  </Center>
  <Center style={{backgroundColor: 'red', 'marginBottom': '20px'}}>
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</p>
    <Breakout size='tiny' style={{backgroundColor: 'darkgreen', height: 20}} />
  </Center>
</div>

```

```react|responsive
<div>
  <Center style={{backgroundColor: 'red', 'marginBottom': '20px'}}>
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</p>
    <Breakout size='breakout' style={{backgroundColor: 'darkgreen', height: 20}} />
  </Center>
  <Center style={{backgroundColor: 'red', 'marginBottom': '20px'}}>
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</p>
    <Breakout size='breakoutLeft' style={{backgroundColor: 'darkgreen', height: 20}} />
  </Center>
</div>
```

```react|responsive
<div>
  <Center style={{backgroundColor: 'red', 'marginBottom': '20px'}}>
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</p>
    <Breakout size='float' style={{backgroundColor: 'darkgreen', height: 20}} />
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</p>
  </Center>
  <Center style={{backgroundColor: 'red', 'marginBottom': '20px'}}>
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</p>
    <Breakout size='floatTiny' style={{backgroundColor: 'darkgreen', height: 20}} />
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</p>
  </Center>
</div>
```
