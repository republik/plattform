`<ShareImagePreview />` renders an in-browser preview of the share image. Say hello to dynamically generated images for social media. 

Supported props:

- `text`
- `fontSize`
- `format`: see `<ShareImageGenerator />` docs for a detailed run-through of the supported formats
- `coloredBackground`: boolean. The color itself comes from the format.
- `illuBackground`: boolean. Columns only (caricature portraits).
- `textPosition`: `top`, `center` or `bottom`. Conditional to the presence of `illuBackground`.
- `customFontStyle`: used for specific formats or in absence of a format 
- `placeholderText`: used in conjunction with the generator
- `socialKey`: either `twitter` or `facebook`. Used in conjunction with the generator and required by `embedPreview`.
- `embedPreview`: add styles specific to social media platform.

```react
<ShareImagePreview 
  fontSize={120}
  text='Arriva Arena!'
  coloredBackground
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
  placeholderText='Text für Twitter'
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
    illuBackground
    textPosition='bottom'
    format={{ 
      title: 'Binswanger',
      section: {
        meta: {
          title: 'Kolumnen' 
        }
      },
      color: '#D2933C',
      shareImage: 'https://republik-assets.s3.eu-central-1.amazonaws.com/assets/binswanger.png',
      shareImageColor: 'https://republik-assets.s3.eu-central-1.amazonaws.com/assets/binswanger-bg.png',
    }}
    socialKey='twitter'
    placeholderText='Text für Twitter'
    embedPreview
  />
 <SharePreviewTwitter 
    title='Es geschah am helllichten Tag' 
    description='In den USA läuft der Amtsenthebungs­prozess gegen Donald Trump. Er zeigt, wie wenig es braucht, um eine Demokratie zu zerstören.' />
</div>
```

# Share Image Generator

A `<ShareImageGenerator />` takes a format type and returns a form to create a share image for that specific format type style.

Supported props:

- `socialKey`: required. Either `twitter` or `facebook`
- `data` and `onInputChange`: an immutable `Map` and a setter. Both based on meta data model from Publikator 
- `format`: the metadata of the article's format. The name of a format supported are:


## Editorial / Default / No Format

```react
state: { value: [['twitterColoredBackground', false],['twitterBackgroundImage', true],['twitterTextPosition', 'bottom'],['twitterFontSize', 60],['twitterFontStyle', 'serifBold'],['twitterText', '']] }
---
<ShareImageGenerator 
  data={Map(state.value)}
  onInputChange={key => (_, inputValue) => setState({value: Map(state.value).set(key, inputValue)})}
  socialKey='twitter'
/>
```

## Editorial
```react
state: { value: [['twitterColoredBackground', false],['twitterBackgroundImage', true],['twitterTextPosition', 'bottom'],['twitterFontSize', 60],['twitterFontStyle', 'serifBold'],['twitterText', '']] }
---
<ShareImageGenerator
  data={Map(state.value)}
  onInputChange={key => (_, inputValue) => setState({value: Map(state.value).set(key, inputValue)})}
  socialKey='twitter'
  format={{ 
    color: '#000'
  }}
/>
```

## Meta
'Meta' uses the format.kind value to set the font. If no value is provided it defaults to Rubis
```react
state: { value: [['twitterColoredBackground', false],['twitterBackgroundImage', true],['twitterTextPosition', 'bottom'],['twitterFontSize', 60],['twitterFontStyle', 'serifBold'],['twitterText', '']] }
---
<ShareImageGenerator
  data={Map(state.value)}
  onInputChange={key => (_, inputValue) => setState({value: Map(state.value).set(key, inputValue)})}
  socialKey='twitter'
  format={{ 
    title: 'Meta',
    section: {
      meta: {
        title: 'Meta' 
      }
    },
    color: '#000',
    kind: 'meta'
  }}
/>
```


## Formate
'Format' uses the format.kind value to set the font. If no value is provided it defaults to Rubis.
```react
state: { value: [['twitterColoredBackground', false],['twitterBackgroundImage', true],['twitterTextPosition', 'bottom'],['twitterFontSize', 60],['twitterFontStyle', 'serifBold'],['twitterText', '']] }
---
<ShareImageGenerator
  data={Map(state.value)}
  onInputChange={key => (_, inputValue) => setState({value: Map(state.value).set(key, inputValue)})}
  socialKey='twitter'
  format={{ 
    title: 'Aus der Arena',
    section: {
      meta: {
        title: 'Format' 
      }
    },
    kind: 'scribble'
  }}
/>
```

## Briefing
```react
state: { value: [['twitterColoredBackground', false],['twitterBackgroundImage', true],['twitterTextPosition', 'bottom'],['twitterFontSize', 60],['twitterFontStyle', 'serifBold'],['twitterText', '']] }
---
<ShareImageGenerator
  data={Map(state.value)}
  onInputChange={key => (_, inputValue) => setState({value: Map(state.value).set(key, inputValue)})}
  socialKey='twitter'
  format={{ 
    title: 'Briefing aus Bern',
    section: {
      meta: {
        title: 'Briefings' 
      }
    },
    color: '#00809C',
    image: 'https://cdn.repub.ch/s3/republik-assets/github/republik/section-durch-die-woche/images/90509b3fc4639b59801bcd0f73dcba1a2433aa8c.png?size=1890x945'
  }}
/>
```

## Aktuelles
```react
state: { value: [['twitterColoredBackground', false],['twitterBackgroundImage', true],['twitterTextPosition', 'bottom'],['twitterFontSize', 60],['twitterFontStyle', 'serifBold'],['twitterText', '']] }
---
<ShareImageGenerator
  data={Map(state.value)}
  onInputChange={key => (_, inputValue) => setState({value: Map(state.value).set(key, inputValue)})}
  socialKey='twitter'
  format={{ 
    title: 'Aktuelles',
    section: {
      meta: {
        title: 'Briefings' 
      }
    },
    color: '#00809C'
  }}
/>
```

## Dialog
Setting type to 'Dialog' enables to choose between Sans-Serif and Serif fonts.

```react
state: { value: [['twitterColoredBackground', false],['twitterBackgroundImage', true],['twitterTextPosition', 'bottom'],['twitterFontSize', 60],['twitterFontStyle', 'serifBold'],['twitterText', '']] }
---
<ShareImageGenerator
  data={Map(state.value)}
  onInputChange={key => (_, inputValue) => setState({value: Map(state.value).set(key, inputValue)})}
  socialKey='twitter'
  format={{ 
    title: 'Dialog',
    section: {
      meta: {
        title: 'Dialog' 
      }
    },
    color: '#3CAD00'
  }}
/>
```

## Kolumne
```react
state: { value: [['twitterColoredBackground', false],['twitterBackgroundImage', true],['twitterTextPosition', 'bottom'],['twitterFontSize', 60],['twitterFontStyle', 'serifBold'],['twitterText', '']] }
---
<ShareImageGenerator
  data={Map(state.value)}
  onInputChange={key => (_, inputValue) => setState({value: Map(state.value).set(key, inputValue)})}
  socialKey='twitter'
  format={{ 
    title: 'Binswanger',
    section: {
      meta: {
        title: 'Kolumnen' 
      }
    },
    color: '#D2933C',
    shareImage: 'https://republik-assets.s3.eu-central-1.amazonaws.com/assets/binswanger.png',
    shareImageColor: 'https://republik-assets.s3.eu-central-1.amazonaws.com/assets/binswanger-bg.png',
  }}
/>
```
