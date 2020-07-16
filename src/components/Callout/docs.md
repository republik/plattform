## Callout

A fixed callout animating in from the bottom on mobile and a in place callout on desktop.

- `initiallyOpen`: boolean, note: after a click outside of it, it hides again
- `icon`: React element
- `align`: `left` (default) or `right`, alignment on desktop

```react|responsive
<div style={{ padding: 20 }}>
  <CalloutMenu icon={<NotificationIcon size={24} />} initiallyOpen>
    Hello&nbsp;World
  </CalloutMenu>
</div>
```

### Right Aligned

```react
<div style={{ padding: 20 }}>
  <div style={{ float: 'right' }}>
    <CalloutMenu align='right'>
      Hello&nbsp;World
    </CalloutMenu>
  </div>
</div>
```

### With Label

```react
<div style={{ padding: 20 }}>
  <div style={{ float: 'right' }}>
    <CalloutMenu align='right' icon={<NotificationIcon size={24} />} label='Callout Label'>
      Hello&nbsp;World
    </CalloutMenu>
  </div>
  <div style={{ float: 'left' }}>
    <CalloutMenu icon={<NotificationIcon size={24} />} label='Callout Label'>
      Hello&nbsp;World
    </CalloutMenu>
  </div>
</div>
```
