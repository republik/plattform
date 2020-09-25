There are two versions of the dropdown component: a native dropdown which uses `<select/>` and `<option/>`, and a virtual dropdown which uses the `downshift` library to manage its behavior and renders the UI using custom components. Both components are API-compatible. But you probably want to use a the third dropdown component, which decides automatically whether to use the virtual or native version. It makes this decision based on the user-agent string, not on the viewport size.

The options are given as a list of objects, each option must have the following keys:

 - **value**: an ID (string) unique across all options.
 - **text**: text label for the UI.
 - **element**: optional React element, with e.g. two lines, to show in virtual UIs. Note: in native selects, e.g. iOS wheel, just the text will be shown.

```react
<pre style={{maxHeight: 380, overflow: 'auto'}}>
  {JSON.stringify(dropdownItems, undefined, 2)}
</pre>
```

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
    console.log('onChange', item)
  }}
/>
```

To explicitly use one or the other, use `<Dropdown.Virtual />` or `<Dropdown.Native />`. Below are the two versions, left the virtual and right the native.

```react
noSource: true
span: 3
state: { value: '2' }
---
<Dropdown.Virtual
  label='Bezeichnung'
  items={dropdownItems}
  value={state.value}
  onChange={(item) => {
    setState({value: item.value})
    console.log('onChange', item)
  }}
/>
```
```react
noSource: true
span: 3
state: { value: '2' }
---
<Dropdown.Native
  label='Bezeichnung'
  items={dropdownItems}
  value={state.value}
  onChange={(item) => {
    setState({value: item.value})
    console.log('onChange', item)
  }}
/>
```

```hint
The virtual dropdown element uses negative margin left/right. This is needed so that the left edge of the text aligns with the other form elements. The example below shows an input field, a virtual dropdown and a native dropdown next to each other.
```

```react|noSource
<div>
  <Field label='Label' />
  <Dropdown.Virtual
    label='Label'
    items={dropdownItems}
  />
  <Dropdown.Native
    label='Label'
    items={dropdownItems}
  />
  <Field label='Label' value={dropdownItems[0].text} />
  <Dropdown.Virtual
    label='Label'
    items={dropdownItems}
    value={dropdownItems[0].value}
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
