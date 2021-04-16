`<ShareImagePreview />` renders an in-browser preview of the share image. Say hello to dynamically generated images for social media. 

Supported props:

- `text`
- `fontSize`
- `format`: see `<ShareImageGenerator />` docs for a detailed run-through of the supported formats
- `inverted`: boolean. White background/colored text vs colored background/white text.
- `textPosition`: `top`, `center` or `bottom`. 
- `preview`: either boolean, `twitter`, or `facebook`. Scales down the image for preview purposes. Add styles specific to social media platform.

```react
<ShareImagePreview 
  fontSize={120}
  text='Arriva Arena!'
  inverted
  format={{ 
    title: 'Aus der Arena',
    section: {
      meta: {
        title: 'Format' 
      }
    },
    color: '#D74132',
    kind: 'scribble'
  }}
  preview
/>
```

## Share Image Social Media Preview

`<ShareImagePreview />` can be used in `embedPreview` mode, together with `<SharePreviewTwitter />` or `<SharePreviewFacebook />`.

Supported props:

- `title`
- `description`

```react
<div>
  <ShareImagePreview
    fontSize={60}
    text='Am helllichten Tag'
    textPosition='bottom'
    format={{ 
      title: 'Binswanger',
      section: {
        meta: {
          title: 'Kolumnen' 
        }
      },
      color: '#D2933C',
      shareBackgroundImage: 'https://republik-assets.s3.eu-central-1.amazonaws.com/assets/binswanger.png',
      shareBackgroundImageInverted: 'https://republik-assets.s3.eu-central-1.amazonaws.com/assets/binswanger-bg.png',
    }}
    preview='twitter'
  />
  <SharePreviewTwitter 
    title='Es geschah am helllichten Tag' 
    description='In den USA läuft der Amtsenthebungs­prozess gegen Donald Trump. Er zeigt, wie wenig es braucht, um eine Demokratie zu zerstören.' 
  />
</div>
```

# Share Image Generator

A `<ShareImageGenerator />` takes a format type and returns a form to create a share image for that specific format type style.

Supported props:
- `fontSize`
- `onFontSizeChange`
- `onFontSizeInc`
- `onFontSizeDec`
- `textPosition`
- `onTextPositionChange`
- `inverted`
- `onInvertedChange`
- `text`
- `onTextChange`
- `format`: the metadata of the article's format. The name of a format supported are:


## Editorial / Default / No Format

```react
state: { 
  fontSize: 60,
  inverted: false,
  text: 'Alle meine Ente'
}
---
<div>
  <ShareImageGenerator
    fontSize={state.fontSize}
    onFontSizeChange={(e, value) => setState({ fontSize: Number(value) || '' })}
    onFontSizeInc={(e, value) => setState({ fontSize: (state.fontSize || 60) + 1})}
    onFontSizeDec={(e, value) => setState({ fontSize: Math.max(state.fontSize - 1, 0)})}
    inverted={state.inverted}
    onInvertedChange={(e, value) => setState({ inverted: value })}
    text={state.text}
    onTextChange={e => setState({ text: e.target.value})}
  />
  <ShareImagePreview
    fontSize={state.fontSize}
    inverted={state.inverted}
    text={state.text}
    preview
  />
</div>
```

## Editorial
```react
state: { 
  fontSize: 60,
  inverted: false,
  text: '',
  format: { 
    color: '#000'
  }
}
---
<div>
  <ShareImageGenerator
    fontSize={state.fontSize}
    onFontSizeChange={(e, value) => setState({ fontSize: Number(value) || '' })}
    onFontSizeInc={(e, value) => setState({ fontSize: (state.fontSize || 60) + 1})}
    onFontSizeDec={(e, value) => setState({ fontSize: Math.max(state.fontSize - 1, 0)})}
    inverted={state.inverted}
    onInvertedChange={(e, value) => setState({ inverted: value })}
    text={state.text}
    onTextChange={e => setState({ text: e.target.value})}
    format={state.format}
  />
  <ShareImagePreview
    fontSize={state.fontSize}
    inverted={state.inverted}
    text={state.text}
    format={state.format}
    preview
  />
</div>
```

## Meta
```react
state: { 
  fontSize: 60,
  inverted: false,
  text: '',
  format: { 
    title: 'Meta',
    section: {
      meta: {
        title: 'Meta' 
      }
    },
    color: '#000',
    kind: 'meta'
  }
}
---
<div>
  <ShareImageGenerator
    fontSize={state.fontSize}
    onFontSizeChange={(e, value) => setState({ fontSize: Number(value) || '' })}
    onFontSizeInc={(e, value) => setState({ fontSize: (state.fontSize || 60) + 1})}
    onFontSizeDec={(e, value) => setState({ fontSize: Math.max(state.fontSize - 1, 0)})}
    inverted={state.inverted}
    onInvertedChange={(e, value) => setState({ inverted: value })}
    text={state.text}
    onTextChange={e => setState({ text: e.target.value})}
    format={state.format}
  />
  <ShareImagePreview
    fontSize={state.fontSize}
    inverted={state.inverted}
    text={state.text}
    format={state.format}
    preview
  />
</div>
```

## Formate
'Format' uses the format.kind value to set the font. If no value is provided it defaults to Rubis.

```react
state: { 
  fontSize: 60,
  inverted: false,
  text: '',
  format: { 
    title: 'Aus der Arena',
    section: {
      meta: {
        title: 'Format' 
      }
    },
    kind: 'scribble'
  }
}
---
<div>
  <ShareImageGenerator
    fontSize={state.fontSize}
    onFontSizeChange={(e, value) => setState({ fontSize: Number(value) || '' })}
    onFontSizeInc={(e, value) => setState({ fontSize: (state.fontSize || 60) + 1})}
    onFontSizeDec={(e, value) => setState({ fontSize: Math.max(state.fontSize - 1, 0)})}
    inverted={state.inverted}
    onInvertedChange={(e, value) => setState({ inverted: value })}
    text={state.text}
    onTextChange={e => setState({ text: e.target.value})}
    format={state.format}
  />
  <ShareImagePreview
    fontSize={state.fontSize}
    inverted={state.inverted}
    text={state.text}
    format={state.format}
    preview
  />
</div>
```

## Briefing

```react
state: { 
  fontSize: 60,
  inverted: false,
  text: '',
  format: { 
    title: 'Briefing aus Bern',
    section: {
      meta: {
        title: 'Briefings' 
      }
    },
    color: '#00809C',
    image: 'https://cdn.repub.ch/s3/republik-assets/github/republik/section-durch-die-woche/images/90509b3fc4639b59801bcd0f73dcba1a2433aa8c.png?size=1890x945'
  }
}
---
<div>
  <ShareImageGenerator
    fontSize={state.fontSize}
    onFontSizeChange={(e, value) => setState({ fontSize: Number(value) || '' })}
    onFontSizeInc={(e, value) => setState({ fontSize: (state.fontSize || 60) + 1})}
    onFontSizeDec={(e, value) => setState({ fontSize: Math.max(state.fontSize - 1, 0)})}
    inverted={state.inverted}
    onInvertedChange={(e, value) => setState({ inverted: value })}
    text={state.text}
    onTextChange={e => setState({ text: e.target.value})}
    format={state.format}
  />
  <ShareImagePreview
    fontSize={state.fontSize}
    inverted={state.inverted}
    text={state.text}
    format={state.format}
    preview
  />
</div>
```

## Aktuelles

```react
state: { 
  fontSize: 60,
  inverted: false,
  text: '',
  format: { 
    title: 'Aktuelles',
    section: {
      meta: {
        title: 'Briefings' 
      }
    },
    color: '#00809C'
  }
}
---
<div>
  <ShareImageGenerator
    fontSize={state.fontSize}
    onFontSizeChange={(e, value) => setState({ fontSize: Number(value) || '' })}
    onFontSizeInc={(e, value) => setState({ fontSize: (state.fontSize || 60) + 1})}
    onFontSizeDec={(e, value) => setState({ fontSize: Math.max(state.fontSize - 1, 0)})}
    inverted={state.inverted}
    onInvertedChange={(e, value) => setState({ inverted: value })}
    text={state.text}
    onTextChange={e => setState({ text: e.target.value})}
    format={state.format}
  />
  <ShareImagePreview
    fontSize={state.fontSize}
    inverted={state.inverted}
    text={state.text}
    format={state.format}
    preview
  />
</div>
```

## Dialog

```react
state: { 
  fontSize: 60,
  inverted: false,
  text: '',
  format: { 
    title: 'Dialog',
    section: {
      meta: {
        title: 'Dialog' 
      }
    },
    color: '#3CAD00',
    kind: 'meta'
  }
}
---
<div>
  <ShareImageGenerator
    fontSize={state.fontSize}
    onFontSizeChange={(e, value) => setState({ fontSize: Number(value) || '' })}
    onFontSizeInc={(e, value) => setState({ fontSize: (state.fontSize || 60) + 1})}
    onFontSizeDec={(e, value) => setState({ fontSize: Math.max(state.fontSize - 1, 0)})}
    inverted={state.inverted}
    onInvertedChange={(e, value) => setState({ inverted: value })}
    text={state.text}
    onTextChange={e => setState({ text: e.target.value})}
    format={state.format}
  />
  <ShareImagePreview
    fontSize={state.fontSize}
    inverted={state.inverted}
    text={state.text}
    format={state.format}
    preview
  />
</div>
```

## Kolumne

```react
state: { 
  fontSize: 60,
  inverted: false,
  text: '',
  textPosition: 'bottom',
  format: { 
    title: 'Binswanger',
    section: {
      meta: {
        title: 'Kolumnen' 
      }
    },
    color: '#D2933C',
    shareBackgroundImage: 'https://republik-assets.s3.eu-central-1.amazonaws.com/assets/binswanger.png',
    shareBackgroundImageInverted: 'https://republik-assets.s3.eu-central-1.amazonaws.com/assets/binswanger-bg.png'
  }
}
---
<div>
  <ShareImageGenerator
    fontSize={state.fontSize}
    onFontSizeChange={(e, value) => setState({ fontSize: Number(value) || '' })}
    onFontSizeInc={(e, value) => setState({ fontSize: (state.fontSize || 60) + 1})}
    onFontSizeDec={(e, value) => setState({ fontSize: Math.max(state.fontSize - 1, 0)})}
    inverted={state.inverted}
    onInvertedChange={(e, value) => setState({ inverted: value })}
    text={state.text}
    onTextChange={e => setState({ text: e.target.value})}
    textPosition={state.textPosition}
    onTextPositionChange={item => setState({ textPosition: item.value })}
    format={state.format}
  />
  <ShareImagePreview
    fontSize={state.fontSize}
    inverted={state.inverted}
    text={state.text}
    textPosition={state.textPosition}
    format={state.format}
    preview
  />
</div>
```

