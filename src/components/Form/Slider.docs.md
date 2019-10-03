```react|plain
state: {example1: 3}
---
<div style={{padding: 20, background: 'white'}}>
    <Label>{'Value: ' + state.example1}</Label>
    <br />
    <Slider
     value={state.example1}
     min='1'
     max='10'
     onChange={(_, example1) => setState({example1})} />
</div>
```

```react|plain
<div style={{padding: 20, background: 'white'}}>
    <Slider
     value='7'
     min='1'
     max='10'
     inactive
     onChange={(e) => e.preventDefault()}
     title='I am inactive' />
</div>
```

```react|plain
state: {example3: 1}
---
<div style={{padding: 20, background: 'white'}}>
    <Label>Full-width slider</Label>
    <br />
    <Slider
     fullWidth={true}
     value={state.example3}
     min='1'
     max='100'
     onChange={(_, example3) => setState({example3})} />
</div>
```

