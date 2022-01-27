```react|plain
state: {example1: 3}
---
<div style={{padding: 20, background: 'white'}}>
    <Slider
     label={'Value: ' + state.example1}
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
    <Slider
     label='Full-width slider'
     fullWidth
     value={state.example3}
     min='1'
     max='100'
     onChange={(_, example3) => setState({example3})} />
</div>
```

