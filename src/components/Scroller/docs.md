## Scroller

The `Scroller` Component arranges its children in a flex row and allows for horizontal scrolling if the content size exeeds the container size. It is the basis of the `<Tab type='scroll' />`components.

Supported Props

- `children` (ReactNode, required):
- `center`? (boolean, false): centers the child nodes when container with exeeds content width.
- `activeScrollItemIndex`? (number, 0): The index of the active scroll item
- `hideArrows`? (boolean, false): Hides the arrows
- `arrowSize`? (number, 28): Arrow Size
- `breakoutWidth`? (number, 0): If the Scroller is in a container with negative horizontal margins, pass those as breakoutWidth to allow for proper padding in full width layouts

```react
state: { activeScrollItemIndex: 0 }
---
<div style={{ margin: '0 -20px' }} >
  <Scroller
    breakoutWidth={20}
    activeScrollItemIndex={state.activeScrollItemIndex}
  >
    <IconButton
      Icon={NotificationIcon}
      label="Child One"
      labelShort="Child One"
      onClick={() => { 
        setState({activeScrollItemIndex: 0})
      }}
    />
    <IconButton
      Icon={NotificationIcon}
      label="Child Two"
      labelShort="Child Two"
      onClick={() => { 
        setState({activeScrollItemIndex: 1})
      }}
    />
    <IconButton
      Icon={NotificationIcon}
      label="Child Three"
      labelShort="Child Three"
      onClick={() => { 
        setState({activeScrollItemIndex: 2})
      }}
    />
    <IconButton
      Icon={NotificationIcon}
      label="Child Four"
      labelShort="Child Four"
      onClick={() => { 
        setState({activeScrollItemIndex: 3})
      }}
    />
    <IconButton
      Icon={NotificationIcon}
      label="Child Five"
      labelShort="Child Five"
      onClick={() => { 
        setState({activeScrollItemIndex: 4})
      }}
    />
  </Scroller>
</div>
```
