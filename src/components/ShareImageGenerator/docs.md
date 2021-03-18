A `<ShareImageGenerator />` takes a format type and returns a form to create a share image for that specific format type style.

Supported props:

- `format`: The name of a format supported are: editorial.


## Editorial / Default / No Format

```react
<ShareImageGenerator />
```

## Editorial
```react
<ShareImageGenerator
  format={{ 
    color: '#000'
  }}
/>
```

## Meta
'Meta' uses the format.kind value to set the font. If no value is provided it defaults to Rubis
```react
<ShareImageGenerator
  format={{ 
    title: 'Meta',
    type: 'Meta',
    color: '#000',
    kind: 'meta'
  }}
/>
```


## Formate
'Format' uses the format.kind value to set the font. If no value is provided it defaults to Rubis.
```react
<ShareImageGenerator
  format={{ 
    title: 'Aus der Arena',
    type: 'Format',
    color: '#D74132',
    kind: 'scribble'
  }}
/>
```

## Briefing
```react
<ShareImageGenerator
  format={{ 
    title: 'Briefing aus Bern',
    type: 'Briefings',
    color: '#00809C',
    image: 'https://cdn.repub.ch/s3/republik-assets/github/republik/section-durch-die-woche/images/90509b3fc4639b59801bcd0f73dcba1a2433aa8c.png?size=1890x945'
  }}
/>
```

## Aktuelles
```react
<ShareImageGenerator
  format={{ 
    title: 'Aktuelles',
    type: 'Briefings',
    color: '#00809C'
  }}
/>
```

## Dialog
Setting type to 'Dialog' enables to choose between Sans-Serif and Serif fonts.

```react
<ShareImageGenerator
  format={{ 
    title: 'Dialog',
    type: 'Dialog',
    color: '#3CAD00'
  }}
/>
```

## Kolumne
```react
<ShareImageGenerator
  format={{ 
    title: 'Binswanger',
    type: 'Kolumnen',
    color: '#D2933C',
    backgroundImage: 'https://republik-assets.s3.eu-central-1.amazonaws.com/assets/binswanger.png',
    backgroundImageColor: 'https://republik-assets.s3.eu-central-1.amazonaws.com/assets/binswanger-bg.png',
  }}
/>
```
