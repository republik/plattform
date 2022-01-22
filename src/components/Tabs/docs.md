## Tabs

Tabs can be used as a navigational element or as filter elements that structure content on screens without navigation.

A Tabs layout can be achieved with the `Scroller` and `TabButton` components They default to horizontal scrolling when tabs exeed the container they are in.

### Scroller

- children (React.ReactNode):
- center? (boolean, false): Centers child nodes when there is enough space.
- activeChildIndex? (number, 0): Index of the active scroll child dom node.
- hideArrows? (boolean, false): Hides arrows.
- arrowSize? (number, 28): Set size of the arrows.
- innerPadding?: (number, 0): If the Scroller is in a container with negative horizontal margins, pass those as innerPadding to allow for proper padding in full width layouts.

### TabButton

- text (string, undefined): The text of the tab.
- isActive? (boolean, undefined): determines the active tab, renders appropriate style
- onClick? (function, undefined): Providing an onClick handler renders the TabButton as a <button> tag.
- href? (string, undefined): Providing an href renders the TabButton as an <a> tag.
- border? (boolean, true): Setting to false will render TabButtons without bottom borders.

### Default Tabs

Default scroll behavior left aligns all the tabs and once the tab container exeeds the viewport, it allows for horizontal scrolling.

```react
state: { activeChildIndex: 1 }
---
<div style={{ margin: '0 -20px' }} >
  <Scroller
    innerPadding={20}
    activeChildIndex={state.activeChildIndex}
  >
    {['One', 'Two', 'Three', 'Four', 'Five', 'Six'].map((n, i) => (
      <TabButton
        key={n}
        text={`Child ${n}`}
        isActive={state.activeChildIndex === i}
        onClick={() => {
          setState({activeChildIndex: i})
        }}
      />
    ))}
  </Scroller>
</div>
```

### Centered Tabs

Default scroll behavior left aligns all the tabs and once the tab container exeeds the viewport, it allows for horizontal scrolling.

```react
state: { activeChildIndex: 0 }
---
<div style={{ margin: '0 -20px' }} >
  <Scroller
    innerPadding={20}
    activeChildIndex={state.activeChildIndex}
    center
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

## Generic Scroller with Custom Children

```react
state: { activeChildIndex: 0 }
---
<div style={{ margin: '0 -20px' }} >
  <Scroller
    innerPadding={20}
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

## Useage Example with Next Link

```code|lang-js
<div style={{ margin: '0 -20px' }} >
  <Scroller
    innerPadding={20}
    center={true}
  >
    <Link href="/" passHref>
      <TabButton
        text="This is a link"
        isActive
      />
    </Link>
  </Scroller>
</div>
```
