```react|plain
state: {value: 3}
---
<div style={{padding: 20, background: 'white'}}>
    <Label>{'Value: ' + state.value}</Label>
    <br />
    <Slider
     value={state.value}
     min='1'
     max='10'
     onChange={(_, value) => setState({value})} />
</div>
```

```react|plain
<div style={{padding: 20, background: 'white'}}>
    <Slider
     value='7'
     min='1'
     max='10'
     inactive={true}
     title='I am inactive' />
</div>
```

```react|plain
state: {value: 1}
---
<div style={{padding: 20, background: 'white'}}>
    <Label>Full-width slider</Label>
    <br />
    <Slider
     fullWidth={true}
     value={state.value}
     min='1'
     max='100'
     onChange={(_, value) => setState({value})} />
</div>
```

