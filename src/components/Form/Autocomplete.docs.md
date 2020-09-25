Provide a list of items and filter its contents with a text input. Uses [VirtualDropdown Internal Components](#virtualdropdown-internal-components) and therefore [`downshift`](https://github.com/paypal/downshift).

Properties:
  * **`items`** - Array of objects of shape `{ value: '1', text: 'Eins'}`
  * **`value`** - Object of shape `{ value: '1', text: 'Eins'}` or `null`. Not necessarily part of `items`.
  * **`filter`** - String that will be shown in the filter text input, or `null`.
  * **`onChange`** - Function with signature `nextValue => Void`.
  * **`onFilterChange`** - Function with signature `nextFilter => Void`.
  * **`icon`** - An icon to display on the right side of the input field, or `undefined`.
  * **`autoComplete`** - The `autocomplete` HTML5 attribute of the input field, defaults to `off` for suppressing the browser autocomplete dropdown.

`<Autocomplete />` does not incorporate any filter logic itself. Also, it can't be used as uncontrolled component. Both the `value` and the `filter` prop have to be passed in order for the component to behave correctly.

```react
state: {
  value: null,
  filter: '',
  items: [
    {text: 'Januar', value: '01'},
    {text: 'Februar', value: '02'},
    {text: 'März', value: '03'},
    {text: 'April', value: '04'},
    {text: 'Mai', value: '05'},
    {text: 'Juni', value: '06'},
    {text: 'Juli', value: '07'},
    {text: 'August', value: '08'},
    {text: 'September', value: '09'},
    {text: 'Oktober', value: '10'},
    {text: 'November', value: '10'},
    {text: 'Dezember', value: '10'}
  ]
}
---
<Autocomplete
  label='Monat'
  value={state.value}
  filter={state.filter}
  items={
    state.items.filter(
      ({text}) =>
        !state.filter || text.toLowerCase().includes(state.filter.toLowerCase())
    )
  }
  onChange={
    value => {
      setState({...state, value})
    }
  }
  onFilterChange={
    filter => setState({...state, filter})
  }
/>
```

```react
state: {
  items: [{text: 'Test', value: 'Test'}, {text: 'Test 2', value: 'Test 2'}]
}
---
<Autocomplete
  label='Monat'
  value={state.items[0]}
  filter=''
  items={state.items}
  onChange={value => {console.log(value)}}
  onFilterChange={filter => {}}
  icon={
    <SearchIcon
      size={30}
      onClick={() => {
        console.log('search')
      }}
    />
  }
  autoComplete='on'
/>
```
