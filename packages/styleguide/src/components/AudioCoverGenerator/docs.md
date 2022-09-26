`<AudioCoverGenerator />` renders an in-browser preview of the share image. Say hello to dynamically generated images for social media.

Supported props:

- `format`: see `<ShareImageGenerator />` docs for a detailed run-through of the supported formats

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

```react
<AudioCoverGenerator
  format={{
    title: 'Briefing aus Bern',
    section: {
      meta: {
        title: 'Briefings'
      }
    },
    color: '#00809C',
    shareLogo: 'https://cdn.repub.ch/s3/republik-assets/github/republik/section-durch-die-woche/images/90509b3fc4639b59801bcd0f73dcba1a2433aa8c.png?size=1890x945'
  }}
/>
```

```react
<AudioCoverGenerator
  format={{
    title: 'Binswanger',
    section: {
      meta: {
        title: 'Kolumnen'
      }
    },
    color: '#D2933C',
    shareBackgroundImage: 'https://republik-assets.s3.eu-central-1.amazonaws.com/assets/binswanger.png',
    shareBackgroundImageInverted: 'https://republik-assets.s3.eu-central-1.amazonaws.com/assets/binswanger-bg.png'
  }}
/>
```
