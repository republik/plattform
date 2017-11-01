The overlay covers the whole screen (100vw, 100vh). It opens with a short fade-in animation upon being mounted.

Below are two examples in different viewport sizes. Click on the button to open the overlay, click anywhere in the overlay to close it again.

```react
noSource: true
plain: true
responsive: Klein
span: 2
---
<OverlayExample>
  <OverlayToolbar>
    <OverlayToolbarClose />
    <OverlayToolbarConfirm label='Speichern' />
  </OverlayToolbar>
</OverlayExample>
```

```react
noSource: true
plain: true
responsive: Gross
span: 4
---
<OverlayExample>
  <OverlayToolbar>
    <OverlayToolbarClose />
    <OverlayToolbarConfirm label='Speichern' />
  </OverlayToolbar>
</OverlayExample>
```

## `<OverlayToolbar />` et al.

The `<OverlayToolbar />` serves as a container for `<OverlayToolbarClose />` and `<OverlayToolbarConfirm />`. Both inner elements are optional.

```react|noSource,plain,span-2
<OverlayToolbar>
  <OverlayToolbarClose />
  <OverlayToolbarConfirm label='Speichern' />
</OverlayToolbar>
```
```react|noSource,plain,span-2
<OverlayToolbar>
  <OverlayToolbarClose />
</OverlayToolbar>
```
```react|noSource,plain,span-2
<OverlayToolbar>
  <OverlayToolbarConfirm label='Speichern' />
</OverlayToolbar>
```
