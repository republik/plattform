## Callout

Callout styles for desktop and mobile.

- `'expanded'`: boolean
- `'leftAligned''`: boolean, flips the callout position on desktop

```react|responsive
<div style={{ position: 'relative', display: 'inline-block', top: 100, left: '40%'}}>
    <CalloutMenu menu={<span>Test</span>} />
</div>
```

### Left aligned
```react|responsive
<div style={{ position: 'relative', display: 'inline-block', top: 100, left: '40%'}}>
    <CalloutMenu menu={<span>Test</span>} leftAligned />
</div>
```