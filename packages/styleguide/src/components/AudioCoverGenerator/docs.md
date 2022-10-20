`<AudioCoverGenerator />` renders generates a cover element from a format imput. It is meant as a fallback for articles without an image.

Supported props:

- `previewSize` (number, required): the size (in pixels) of the audio cover rectangle.
- `format` (object, optional): an object that describes the format of the document.

### Fallback if no format is provided

If only a previewSize is provided, the generator renders a black square with an "R" in the middle.

```react
<div style={{display: 'flex', gap: 16}}>
  <AudioCoverGenerator
    previewSize={64}
  />
  <AudioCoverGenerator
    previewSize={128}
  />
</div>
```

### Format title and color

If a format title and color is provided, it renders the title in front of a tinted gray background.

```react
<div style={{display: 'flex', gap: 16}}>
  <AudioCoverGenerator
    format={{ title: 'Aus der Arena', color: '#D74132' }}
    previewSize={64}
  />
  <AudioCoverGenerator
    format={{title: 'Aus der Arena',color: '#D74132' }}
    previewSize={128}
  />
</div>
```

### shareLogo

If the format has a shareLogo, it is used for the cover. A color is also required to render the background.

```react
<AudioCoverGenerator
  previewSize={128}
  format={{
    color: '#00809C',
    shareLogo: 'https://cdn.repub.ch/s3/republik-assets/github/republik/section-durch-die-woche/images/90509b3fc4639b59801bcd0f73dcba1a2433aa8c.png?size=1890x945'
  }}
/>
```

### shareBackgroundImage

If the format has a shareBackgroundImage, it is used for the cover. shareBackgroundImageInverted is used.

```react
<div style={{display: 'flex', gap: 16}}>
  <AudioCoverGenerator
    previewSize={128}
    format={{
      shareBackgroundImageInverted: 'https://republik-assets.s3.eu-central-1.amazonaws.com/assets/binswanger-bg.png'
    }}
  />
</div>

```
