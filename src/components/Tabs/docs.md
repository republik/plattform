## Tabs

Tabs can be used as a navigational element or as filter elements that structure content on screens without navigation.

A Tabs layout can be achieved with the `Scroller` and `TabButton` components They default to horizontal scrolling when tabs exeed the container they are in.

### Scroller

- children (React.ReactNode): 
- center? (boolean, false): Centers child nodes when there is enough space. 
- activeChildIndex? (activeChildIndex, 0): Index of the active scroll child dom node.
- hideArrows? (boolean, false): Hides arrows
- arrowSize? (number, 28): Set size of the arrows.
- breakoutPadding?: (number, 0): If the Scroller is in a container with negative horizontal margins, pass those as breakoutPadding to allow for proper padding in full width layouts.

### TabButton

- text: string
- isActive: string
- onClick: () => void
- href: string

### Tabs

Default scroll behavior left aligns all the tabs and once the tab container exeeds the viewport, it allows for horizontal scrolling.

```react
state: { activeChildIndex: 0 }
---
<div style={{ margin: '0 -20px' }} >
  <Scroller
    breakoutPadding={20}
    activeChildIndex={state.activeChildIndex}
  >
    <TabButton
      text="Child One"
      isActive={state.activeChildIndex === 0}
      onClick={() => {
        setState({activeChildIndex: 0})
      }}
    />
    <TabButton
      text="Child Two"
      isActive={state.activeChildIndex === 1}
      onClick={() => {
        setState({activeChildIndex: 1})
      }}
    />
    <TabButton
      text="Child Three"
      isActive={state.activeChildIndex === 2}
      onClick={() => {
        setState({activeChildIndex: 2})
      }}
    />
    <TabButton
      text="Child Four"
      isActive={state.activeChildIndex === 3}
      onClick={() => {
        setState({activeChildIndex: 3})
      }}
    />
  </Scroller>
</div>
```

## Generic Scroller

```react
state: { activeChildIndex: 0 }
---
<div style={{ margin: '0 -20px' }} >
  <Scroller
    breakoutPadding={20}
    activeChildIndex={state.activeChildIndex}
  >
    <button
      {...plainButtonRule}
      onClick={() => {
        setState({activeChildIndex: 0})
      }}
    >
      <FormatTag
        color={state.activeChildIndex === 0 ? 'text' : 'textSoft'}
        label='Alle'
        count={3216}
      />
    </button>
    <button
      {...plainButtonRule}
      onClick={() => {
        setState({activeChildIndex: 1})
      }}
    >
      <FormatTag
        color={state.activeChildIndex === 1 ? 'text' : 'textSoft'}
        label='Lob'
        count={383}
      />
    </button>
    <button
      {...plainButtonRule}
      onClick={() => {
        setState({activeChildIndex: 2})
      }}
    >
      <FormatTag
        color={state.activeChildIndex === 2 ? 'text' : 'textSoft'}
        label='Kritik'
        count={608}
      />
    </button>
    <button
      {...plainButtonRule}
      onClick={() => {
        setState({activeChildIndex: 3})
      }}
    >
      <FormatTag
        color={state.activeChildIndex === 3 ? 'text' : 'textSoft'}
        label='Wünsche'
        count={1588}
      />
    </button>
    <button
      {...plainButtonRule}
      onClick={() => {
        setState({activeChildIndex: 4})
      }}
    >
      <FormatTag
        color={state.activeChildIndex === 4 ? 'text' : 'textSoft'}
        label='Sonstiges'
        count={637}
      />
    </button>
  </Scroller>
</div>
```
