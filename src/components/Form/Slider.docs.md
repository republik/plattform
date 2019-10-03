Hello, I am a slider:

```react
state: {value: 3}
---
<Slider
 value={value}
 min='1'
 max='10'
 onChange={(_, checked) => setState({checked})} />
```

Btw this doesn't want to render -> Fix meeeee!