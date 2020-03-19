## Callout

Callout styles for desktop and mobile.

- `'expanded'`: boolean
- `'leftAligned''`: boolean, flips the callout position on desktop

```react|responsive
state: {showMenu: false}
---
<div style={{ position: 'relative', display: 'inline-block', top: 100, left: '40%'}}>
    <button {...plainButtonRule} style={{ backgroundColor: 'red', borderRadius: '50%', padding: 3 }} 
            onClick={() => {setState({showMenu: !state.showMenu})}}>
    <MoreIcon />
    </button>
    { state.showMenu && (<Callout onClose={() => {setState({showMenu: false})}}>
        <span>Test</span>
    </Callout>) }
</div>
```

### Left aligned
```react|responsive
state: {showMenu: false}
---
<div style={{ position: 'relative', display: 'inline-block', top: 100, left: '40%'}}>
    <button {...plainButtonRule} style={{ backgroundColor: 'red', borderRadius: '50%', padding: 3 }} 
            onClick={() => {setState({showMenu: !state.showMenu})}}>
    <MoreIcon />
    </button>
    { state.showMenu && (<Callout leftAligned
             onClose={() => {setState({showMenu: false})}}>
        <span>Test</span>
    </Callout>) }
</div>
```