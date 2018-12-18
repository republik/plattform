Utility function for wrapping a string in quotation marks and avoiding double quoting. Ignores already quoted strings of the same quotation marks pattern and replaces nested quotation marks. No support for third level nested quotation marks or transformations between different quotation mark patterns.

```code|lang-js
import {inQuotes} from '@project-r/styleguide'

const quotedTitle = inQuotes('My title')  // '«My title»'
```


```react
<Editorial.Subhead>{inQuotes('An der Bar')}</Editorial.Subhead>
```

```react
<Editorial.Subhead>{inQuotes('«An der Bar»')}</Editorial.Subhead>
```

```react
<Editorial.Subhead>{inQuotes('«An der Bar» mit Carla Del Ponte')}</Editorial.Subhead>
```

```react
<Editorial.Subhead>{inQuotes('An der «Republik-Bar» mit Carla Del Ponte')}</Editorial.Subhead>
```

```react
<Editorial.Subhead>
  {inQuotes(
    'An der „Republik-Bar“ mit Carla Del Ponte',
    {
      outerOpening: '„',
      outerClosing: '“',
      innerOpening: '‚',
      innerClosing: '‘'
    }
  )}
</Editorial.Subhead>
```
