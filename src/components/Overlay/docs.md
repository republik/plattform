On small devices the overlay covers the whole screen, has a sticky toolbar and the content below scrolls. On larger devices the overlay is centered and scrolls whole.

The overlay blocks scrolling of the underlying page through `overflow:hidden` and `position:fixed` on the body element. The later is required on touch devices. Setting `position:fixed` on the body element scrolls the page to the top. To counter that we shift the whole page up (`top: -Npx`) while the overlay is open.

```react
noSource: true
plain: true
responsive: Klein
span: 2
---
<OverlayRenderer isVisible onClose={() => {}}>
  <OverlayToolbar>
    <OverlayToolbarClose onClick={() => {}} />
    <OverlayToolbarConfirm label='Speichern' onClick={() => {}} />
  </OverlayToolbar>
</OverlayRenderer>
```
```react
noSource: true
plain: true
responsive: Gross
span: 4
---
<OverlayRenderer isVisible onClose={() => {}}>
  <OverlayToolbar>
    <OverlayToolbarClose onClick={() => {}} />
    <OverlayToolbarConfirm label='Speichern' onClick={() => {}} />
  </OverlayToolbar>
</OverlayRenderer>
```

The overlay opens with a short fade-in animation upon being mounted. Click on the button to open the overlay, click anywhere on the background scroll block element, the close icon or the *save* button to close it again.

Note that due to limitations of the catalog the sidebar is always above the overlay.

```react
noSource: true
plain: true
---
<OverlayExample>
  {({onClose}) => (
    <Overlay onClose={onClose}>
      <OverlayToolbar>
        <OverlayToolbarClose onClick={onClose} />
        <OverlayToolbarConfirm label='Speichern' onClick={onClose} />
      </OverlayToolbar>

      <OverlayBody>
        <div style={{marginBottom: 12}}>
          <Checkbox checked onChange={() => {}}>
            Anonym kommentieren
          </Checkbox>
        </div>

        <Field label='Name' value='Christof Moser' />

        <Interaction.P style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          This is a placeholder to make the overlay content taller than the viewport
          so that we can test the overflow behavior.
        </Interaction.P>
      </OverlayBody>
    </Overlay>
  )}
</OverlayExample>
```

## `<OverlayToolbar />` et al.

The `<OverlayToolbar />` serves as a container for `<OverlayToolbarClose />` and `<OverlayToolbarConfirm />`. Both inner elements are optional.

```react|noSource,plain,frame,span-2
<div style={{height: 48}}>
  <OverlayToolbar>
    <OverlayToolbarClose onClick={() => {}} />
    <OverlayToolbarConfirm label='Speichern' onClick={() => {}} />
  </OverlayToolbar>
</div>
```
```react|noSource,plain,frame,span-2
<div style={{height: 48}}>
  <OverlayToolbar>
    <OverlayToolbarClose onClick={() => {}} />
  </OverlayToolbar>
</div>
```
```react|noSource,plain,frame,span-2
<div style={{height: 48}}>
  <OverlayToolbar>
    <OverlayToolbarConfirm label='Speichern' onClick={() => {}} />
  </OverlayToolbar>
</div>
```

## `<OverlayBody />`

Wrap the content in a `<OverlayBody />`. It adds appropriate amount of padding and leaves enough space at the top for the `<OverlayToolbar />`.

```react
responsive: Gross
---
<OverlayRenderer isVisible onClose={() => {}}>
  <OverlayToolbar>
    <OverlayToolbarClose onClick={() => {}} />
    <OverlayToolbarConfirm label='Speichern' onClick={() => {}} />
  </OverlayToolbar>

  <OverlayBody>
    <Interaction.P>
      The overlay body be here.
    </Interaction.P>
  </OverlayBody>
</OverlayRenderer>
```
