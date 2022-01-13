`<Center />` defines a max-width and ensures a horizontal padding. The boolean `breakout` prop allows for a wider max-width that is of breakout size.

`<Breakout />` allows to adjust `size` (and positioning) of its content:
- `undefined` and `'normal'` (default, do nothing)
- `'narrow'`
- `'tiny'`
- `'breakout'`
- `'breakoutLeft'`
- `'float'`
- `'floatSmall'`
- `'floatTiny'`

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
    <Breakout size='floatSmall' style={{backgroundColor: 'darkgreen', height: 20}} />
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</p>
  </Center>
  <Center style={{backgroundColor: 'red', 'marginBottom': '20px'}}>
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</p>
    <Breakout size='floatTiny' style={{backgroundColor: 'darkgreen', height: 20}} />
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</p>
  </Center>
</div>
```

One can't breakout of `<Center breakout>`, but floats still work:

```react|responsive
<div>
  <Center breakout style={{backgroundColor: 'red', 'marginBottom': '20px'}}>
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</p>
    <Breakout size='breakout' style={{backgroundColor: 'darkgreen', height: 20}} />
  </Center>
  <Center breakout style={{backgroundColor: 'red', 'marginBottom': '20px'}}>
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</p>
    <Breakout size='breakoutLeft' style={{backgroundColor: 'darkgreen', height: 20}} />
  </Center>
  <Center breakout style={{backgroundColor: 'red', 'marginBottom': '20px'}}>
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</p>
    <Breakout size='float' style={{backgroundColor: 'darkgreen', height: 20}} />
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</p>
  </Center>
  <Center breakout style={{backgroundColor: 'red', 'marginBottom': '20px'}}>
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</p>
    <Breakout size='floatSmall' style={{backgroundColor: 'darkgreen', height: 20}} />
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</p>
  </Center>
  <Center breakout style={{backgroundColor: 'red', 'marginBottom': '20px'}}>
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</p>
    <Breakout size='floatTiny' style={{backgroundColor: 'darkgreen', height: 20}} />
    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</p>
  </Center>
</div>
```
