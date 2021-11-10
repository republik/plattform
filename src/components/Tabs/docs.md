## Tabs

Tabs organize content - they can be used as a navigational element - thus organizing different screens - or as filter elements that structure content on screens without navigation.

They are designed with different usecases in mind and support three distinct responsive layout behaviors: horizontal scrolling, collapsing to a dropdown and a fixed mode.

Supported props:
- `type`: ('scroll' | 'fixed' | 'dropdown', defaults to 'scroll'), determines the layout of the tabs.
- `items`: ([{value: string, text: string, element?: ReactNode }]), tab items that should be rendered. the element prop allows rendering of a react element instead of just text.
- `activeValue`: (string), value of the active tab.
- `onChange`: (fn), function that is called on tab clicks.
- `dropDownlabel`: (string), required if type: dropdown.
- `scrollFullWidth`: (boolean?), only has effect if type = 'scroll'. Renders tabs without horizontal padding.
- `scrollCentered`: (boolean?), only has effect if type = 'scroll'. Centers Tab Items.
- `scrollHideArrows`: (boolean?), only has effect if type = 'scroll'. Removes arrows.


### Scroll
Default scroll behavior left alignes all the tabs and once the tab container exeeds the viewport, it allows for horizontal scrolling.

```react
state: { activeValue: '2' }
---
<Tabs
  dropdownLabel='Bezeichnung'
  type='scroll'
  items={tabItems}
  activeValue={state.activeValue}
  onChange={(item) => {
    setState({activeValue: item.value})
    console.log('onChange', item)
  }}
/>
```

### Scroll, centered 
Same as default but centers tabs when tab container is smaller than viewport. This example also removes arrows and paddings.

```react
state: { activeValue: '2' }
---
<Tabs
  dropdownLabel='Bezeichnung'
  type='scroll'
  items={tabItems}
  activeValue={state.activeValue}
  scrollCentered={true}
  scrollfullWidth={true}
  scrollHideArrows={true}
  onChange={(item) => {
    setState({activeValue: item.value})
    console.log('onChange', item)
  }}
/>
```

### Dropdown
Dropdown looks the same as default scroll on desktop (left aligned). On mobile it renders a dropdown instead of a horizontal scroll.

```react
state: { activeValue: '2' }
---
<Tabs
  dropdownLabel='Bezeichnung'
  type='dropdown'
  items={tabItems}
  activeValue={state.activeValue}
  onChange={(item) => {
    setState({activeValue: item.value})
    console.log('onChange', item)
  }}
/>
```

### Fixed
Fixed sets the tab width to 1/(Number of Tabs) and ellipsyses text in the tabs.

```react
state: { activeValue: '2' }
---
<Tabs
  dropdownLabel='Bezeichnung'
  type='fixed'
  items={tabItems}
  activeValue={state.activeValue}
  onChange={(item) => {
    setState({activeValue: item.value})
    console.log('onChange', item)
  }}
/>
```

### Custom elements


```react
state: { activeValue: '2' }
---
<Tabs
  dropdownLabel='Bezeichnung'
  type='fixed'
  items={[
    { value: '1', text: 'Tab Number One', element: <NotificationIcon size={28} /> },
    { value: '2', text: 'Tab Two', element: <NotificationIcon size={28} />  },
    { value: '3', text: 'Tab Three Yay', element: <NotificationIcon size={28} />  }
  ]}
  activeValue={state.activeValue}
  onChange={(item) => {
    setState({activeValue: item.value})
    console.log('onChange', item)
  }}
/>
```
