On small devices the overlay covers the whole screen, has a sticky toolbar and the content below scrolls. On larger devices the overlay is centered and scrolls whole.

The overlay blocks scrolling of the underlying page through `overflow:hidden` and `position:fixed` on the body element. The later is required on touch devices. Setting `position:fixed` on the body element scrolls the page to the top. To counter that we shift the whole page up (`top: -Npx`) while the overlay is open.

```react
noSource: true
plain: true
responsive: Mobile
span: 2
---
<OverlayRenderer isVisible onClose={() => {}}>
  <OverlayToolbar title='Traditional Title' onClose={() => undefined} />
</OverlayRenderer>
```
```react
noSource: true
plain: true
responsive: Desktop small
span: 4
---
<OverlayRenderer isVisible onClose={() => {}}>
  <OverlayToolbar title='Tragicomic Title' onClose={() => undefined} />
</OverlayRenderer>
```

The overlay opens with a short fade-in animation upon being mounted. Following is an example how to open the overlay in response to a button press.

```react
state: {isOpen: false, sliderValue}
---
<div style={{padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
  <Button primary onClick={() => {setState({isOpen: true})}}>
    Open Overlay
  </Button>

  {state.isOpen && (
    <Overlay onClose={() => {setState({isOpen: false})}}>
      <OverlayToolbar onClose={() => {setState({isOpen: false})}} />
      <OverlayBody>
        <Interaction.P style={{height: '100vh'}}>
          This is a placeholder to make the overlay content taller than the viewport
          so that we can test the overflow behavior.
        </Interaction.P>
        <Interaction.P>
          And a slider to test that it is still usable on iOS with the body scroll lock.
          <Slider
           fullWidth
           value={state.sliderValue}
           min='1'
           max='100'
           onChange={(_, sliderValue) => setState({sliderValue})} />
        </Interaction.P>
        <Interaction.P>
          The End.
        </Interaction.P>
      </OverlayBody>
    </Overlay>
  )}
</div>
```

## `<OverlayToolbar />` et al.

The `<OverlayToolbar />` can take as input:
    
- `onClose`: renders a close button to the right
- `title`: can either be a string or a more sophisticated element (e.g. button or tabs)
- `children`: if one wishes to render something custom

```react|noSource,plain,frame,span-3
<div style={{height: 48}}>
  <OverlayToolbar title='Tantalizing Title'  onClose={() => undefined} />
</div>
```
```react|noSource,plain,frame,span-3
<div style={{height: 48}}>
  <OverlayToolbar onClose={() => undefined} title='test'>
    <span style={{ fontSize: 9, position: 'absolute', top: 18, left: 42 }}>BETA</span>
  </OverlayToolbar>
</div>
```
```react|noSource,plain,frame,span-3
state: {tab: 1}
---
<div style={{height: 48}}>
  <OverlayToolbar 
   title={
      <div>
        <span style={{ cursor: 'pointer', fontWeight: state.tab == 1 ? 500 : 300, marginRight: 10 }} onClick={() => {setState({tab: 1})}}>One Tab</span>
        <span style={{ cursor: 'pointer', fontWeight: state.tab == 2 ? 500 : 300 }} onClick={() => {setState({tab: 2})}}>Two Tabs</span>
      </div>
   } 
  />
</div>
```

## `<OverlayBody />`

Wrap the content in a `<OverlayBody />`. It adds appropriate amount of padding and leaves enough space at the top for the `<OverlayToolbar />`.

```react
responsive: Desktop small
---
<OverlayRenderer isVisible onClose={() => {}}>
  <OverlayToolbar title='Tyrannicidal Title' onClose={() => undefined} />
  <OverlayBody>
    <Interaction.P>
      The overlay body be here.
    </Interaction.P>
  </OverlayBody>
</OverlayRenderer>
```

## Overlay `mini`

```react
noSource: true
plain: true
responsive: Mobile
span: 2
---
  <OverlayRenderer mini isVisible onClose={() => {}} mini>
    <OverlayToolbar title='Mini Overlay' onClose={() => undefined} />
    <OverlayBody>
      <Interaction.P>
        The overlay body be here.
      </Interaction.P>
    </OverlayBody>
  </OverlayRenderer>
```