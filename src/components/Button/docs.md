## Default

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

## Primary

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

## Naked
The naked prop removes the background color from the button. They retain size and padding consistencies, so they can easily be paired with buttons for less desired actions, like cancelling.

```react|span-6
<>
  <Button primary>
    Mitmachen
  </Button>
  <Button naked primary>
    Monatsabo
  </Button>
  <Button naked>
    Abbrechen
  </Button>
</>
```


```react|span-3
<>
  <Button naked simulate='hover'>
    Mitmachen
  </Button>
  <Button naked primary simulate='hover'>
    Mitmachen
  </Button>
</>
```

```react|span-3
<>
  <Button naked simulate='active'>
    Mitmachen
  </Button>
  <Button naked primary simulate='active'>
    Mitmachen
  </Button>
</>
```

```react|span-3
<>
  <Button naked disabled>
    Mitmachen
  </Button>
  <Button naked primary disabled>
    Mitmachen
  </Button>
</>
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

## Small

Small buttons have no minimum width. They can be used for narrow UI spaces, like save actions on forms.

```react|span-3
<>
  <Button small style={{marginRight: 16}}>
    Jöh!
  </Button>
  <Button small primary>
    Jöh!
  </Button>
</>
```

```react|span-3
<>
<Button small primary style={{marginRight: 16}}>
  speichern
</Button>
<Button small naked>
  abbrechen
</Button>
</>
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
