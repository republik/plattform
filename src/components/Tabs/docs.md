## Tabs

Supported props:

- `tabMode`: scroll | fixed . default is scroll Tabs support two modes, either fixed or scr.
- `collabsable`: bool, if set to true the tabs collapse to a dropdown menu on mobile breakpoint
- `fullWidth`: bool, defaults to true, if set to false it renders arrows and a fade left and right


```react
state: { value: '2' }
---
<Tabs
  dropdownLabel='Bezeichnung'
  type='dropdown'
  items={tabItems}
  value={state.value}
  onChange={(item) => {
    setState({value: item.value})
    console.log('onChange', item)
  }}
/>
```

```react
state: { value: '2' }
---
<Tabs
  dropdownLabel='Bezeichnung'
  type='scroll'
  items={tabItems}
  value={state.value}
  onChange={(item) => {
    setState({value: item.value})
    console.log('onChange', item)
  }}
/>
```

```react
state: { value: '2' }
---
<Tabs
  dropdownLabel='Bezeichnung'
  type='fixed'
  items={tabItems}
  value={state.value}
  onChange={(item) => {
    setState({value: item.value})
    console.log('onChange', item)
  }}
/>
```