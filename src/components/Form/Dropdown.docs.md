There are two versions of the dropdown component: a native dropdown which uses `<select/>` and `<option/>`, and a virtual dropdown which uses the `downshift` library to manage its behavior and renders the UI using custom components. Both components are API-compatible. But you probably want to use a the third dropdown component, which decides automatically whether to use the virtual or native version. It makes this decision based on the user-agent string, not on the viewport size.

The options are given as a list of objects, each option must have the following keys:

 - **value**: an ID (string) unique across all options.
 - **text**: what is shown in the UI.

Here is the high-level `<Dropdown />` component:

```react
state: { value: '2' }
---
<Dropdown
  label='Bezeichnung'
  items={dropdownItems}
  value={state.value}
  onChange={(item) => {
    setState({value: item.value})
    console.log(`Selected '${item.text}'`)
  }}
/>
```

To explicitly use one or the other, use `<Dropdown.Virtual />` or `<Dropdown.Native />`. Below are the two versions, left the virtual and right the native.

```react
noSource: true
span: 3
state: { value: '2' }
---
<VirtualDropdown
  label='Bezeichnung'
  items={dropdownItems}
  value={state.value}
  onChange={(item) => {
    setState({value: item.value})
    console.log(`Selected '${item.text}'`)
  }}
/>
```
```react
noSource: true
span: 3
state: { value: '2' }
---
<NativeDropdown
  label='Bezeichnung'
  items={dropdownItems}
  value={state.value}
  onChange={(item) => {
    setState({value: item.value})
    console.log(`Selected '${item.text}'`)
  }}
/>
```

```hint
The virtual dropdown element uses negative margin left/right. This is needed so that the left edge of the text aligns with the other form elements. The example below shows an input field, a virtual dropdown and a native dropdown next to each other.
```

```react|noSource
<div>
  <Field label='Label' />
  <VirtualDropdown
    label='Bezeichnung'
    items={dropdownItems}
  />
  <NativeDropdown
    label='Bezeichnung'
    items={dropdownItems}
  />
</div>
```

### Black and White

```react|span-3
<Dropdown black
  label='Bezeichnung'
  items={dropdownItems} />
```

```react|span-3,dark
<Dropdown white
  label='Bezeichnung'
  items={dropdownItems} />
```

### VirtualDropdown Internal Components

#### `<Items />`

Renders a list of items, where one may be selected and one may be highlighted. This component is pure, controlled entirely from the outside. The selected / highlighted item is tracked by the `Downshift` component.

```react|span-2,plain,noSource
<VirtualDropdownInternal.Items
  items={dropdownItems}
  selectedItem={null}
  highlightedIndex={null}
  getItemProps={() => ({})}
/>
```
```react|span-2,plain,noSource
<VirtualDropdownInternal.Items
  items={dropdownItems}
  selectedItem={dropdownItems[0]}
  highlightedIndex={null}
  getItemProps={() => ({})}
/>
```
```react|span-2,plain,noSource
<VirtualDropdownInternal.Items
  items={dropdownItems}
  selectedItem={dropdownItems[0]}
  highlightedIndex={2}
  getItemProps={() => ({})}
/>
```

#### `<ItemsContainer />`

Wrapper around `<Items />` which implements the expand/collapse animation. The state is controlled by the `isOpen` prop. Note: this element uses negative margin left/right.

```react
span: 2
plain: true
noSource: true
state: {isOpen: false}
---
<div>
  <Button primary block onClick={() => {setState({isOpen: !state.isOpen})} }>
    toggle
  </Button>
  <div style={{minHeight: dropdownItems.length * 60 + 24, padding: 12}}>
    <VirtualDropdownInternal.ItemsContainer isOpen={state.isOpen}>
      <VirtualDropdownInternal.Items
        items={dropdownItems}
        selectedItem={dropdownItems[0]}
        highlightedIndex={1}
        getItemProps={() => ({})}
      />
    </VirtualDropdownInternal.ItemsContainer>
  </div>
</div>
```

#### `<Inner />`

Wrapper around the whole dropdown which add a drop shadow when the dropdown is open. It is `position:absolute` so that the items won't affect the layout of the page around the dropdown. So make sure to place this inside an element with relative position and fixed height.

On the left is an example with a static element inside it. On the right one which uses `<ItemsContainer />`.

```react
span: 3
plain: true
noSource: true
state: {isOpen: false}
---
<div style={{height: 276, padding: '60px 72px'}}>
  <div style={{position: 'relative'}}>
    <VirtualDropdownInternal.Inner isOpen={state.isOpen}>
      <div style={{padding: '48px 60px'}}>
        <Button primary block onClick={() => {setState({isOpen: !state.isOpen})} }>
          toggle
        </Button>
      </div>
    </VirtualDropdownInternal.Inner>
  </div>
</div>
```

```react
span: 3
plain: true
noSource: true
state: {isOpen: false}
---
<div style={{height: 276, padding: '60px 48px'}}>
  <div style={{position: 'relative'}}>
    <VirtualDropdownInternal.Inner isOpen={state.isOpen}>
      <div style={{padding: '48px 60px'}}>
        <Button primary block onClick={() => {setState({isOpen: !state.isOpen})} }>
          toggle
        </Button>

        <VirtualDropdownInternal.ItemsContainer isOpen={state.isOpen}>
          <VirtualDropdownInternal.Items
            items={dropdownItems}
            selectedItem={dropdownItems[0]}
            highlightedIndex={1}
            getItemProps={() => ({})}
          />
        </VirtualDropdownInternal.ItemsContainer>
      </div>
    </VirtualDropdownInternal.Inner>
  </div>
</div>
```

### Autocomplete

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
