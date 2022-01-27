## Callout

A fixed callout animating in from the bottom on mobile and a in place callout on desktop.

- `initiallyOpen`: boolean, note: after a click outside of it, it hides again
- `icon`: React element
- `align`: `left` (default) or `right`, alignment on desktop
- `contentPaddingMobile`: set padding of callout content. (Defaults to "safari safe": `'15px 15px 50px'`).

```react|responsive
<div style={{ padding: 20 }}>
  <CalloutMenu Element={(props) => <NotificationIcon size={24} {...props}/> } initiallyOpen contentPadding={16}>
    Hello&nbsp;World
  </CalloutMenu>
</div>
```

### Right Aligned

```react
<div style={{ padding: 20 }}>
  <div style={{ float: 'right' }}>
    <CalloutMenu Element={(props) => <NotificationIcon size={24} {...props}/>} align='right' initiallyOpen>
      Hello&nbsp;World
    </CalloutMenu>
  </div>
</div>
```
