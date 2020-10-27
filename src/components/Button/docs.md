##  Primary

```react|span-3
<Button primary>
  Mitmachen
</Button>
```

```react|span-3
<Button primary disabled>
  Mitmachen
</Button>
```

```react|span-3
<Button primary simulate='hover'>
  Mitmachen
</Button>
```

```react|span-3
<Button primary simulate='active'>
  Mitmachen
</Button>
```

## Secondary

```react|span-3
<Button>
  Weiter
</Button>
```

```react|span-3
<Button disabled>
  Weiter
</Button>
```

```react|span-3
<Button simulate='hover'>
  Weiter
</Button>
```

```react|span-3
<Button simulate='active'>
  Weiter
</Button>
```

## Button Link

```react|span-3
<Button 
 href='https://www.republik.ch/feed' 
 primary>
  Zum Feed
</Button>
```

```react|span-3
<Button 
 href='https://www.republik.ch/feed' 
 title='Republik feed anzeigen'>
  Zum Feed
</Button>
```

```react
<Button 
 href='https://reactjs.org/' 
 title="You don't know what's gonna hit you"
 target='_blank'
 block>
  Open link in a new tab
</Button>
```


## Big

```react|span-3
<Button big primary>
  Päng!
</Button>
```

```react|span-3
<Button big>
  Päng
</Button>
```

### Special Cases

To fit, e.g. in a header, it's permissible to set an explicit height.

```react
<Button style={{height: 50}}>
  Päng
</Button>
```

## Block

```react
<Button block>
  Volle Breite
</Button>
```

```react
<Button block big>
  Päng, Päng!
</Button>
```

## Plain Button

```react|span-3
<button
  {...plainButtonRule}
  onClick={() => alert('A11Y ftw')}
  title="Artikel anhören">
  <AudioIcon />
</button>
```

```react|span-3
<button
  {...merge(plainButtonRule,
    { backgroundColor: '#000', borderRadius: '50%', width: 50, height: 50 }
  )}>
  <AudioIcon fill='#fff' />
</button>
```

Use [glamors `css` or `merge`](https://github.com/threepointone/glamor/blob/master/docs/howto.md#combined-selectors) to ensure your `border`, `background`, `padding` and other styles take precedence over the plain rule.
