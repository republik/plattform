A `<TeaserFeed />` is a concise article teaser used in a feed context.

Supported props:
- `format`: An optional format which appears on top of the headline.
- `kind`: String `meta` or `editorial` (default)
- `color`: Color for top border and title
- `Link`, a Next.js like `<Link />` component
  This will be wrapped around links. You should attach an `onClick` handler within, if you wish to do client side routing and or prefetching. The component recieves following props:
  - `href` String, target url or path
  - `passHref` Boolean, indicates this will eventually end in an a tag and you may overwrite href
- `bar`: an optional React element for actions.
- `prepublication`: Whether the teaser is for a prepublished article.
- `menu`: callout menu
- `focus`: highlight the teaser

Data props:
- `title`
- `description`
- `credits`
- `publishDate`
- `highlight`
- `highlightLabel`

Only using title is great for compact feeds:

```react
<TeaserFeed
  title='The quick brown fox jumps over the lazy dog'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31.12.2017'},
  ]}
  bar={<span>
    <BookmarkIcon size={22} style={{ margin: '0 5px 0 -4px'}} />
    <AudioIcon size={22} />
  </span>}
/>
```

```react
<TeaserFeed
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31.12.2017'},
  ]}
  bar={<span>
    <BookmarkIcon size={22} style={{ margin: '0 5px 0 -4px'}} />
    <AudioIcon size={22} />
  </span>}
/>
```

```react
<TeaserFeed format={{meta: {title: 'Format'}}}
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31.12.2017'},
  ]}
  t={t}
  prepublication={true}
/>
```

```react
<TeaserFeed kind='editorial' format={{meta: {title: 'Format'}}}
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  publishDate='2017-12-31T11:34:00.000Z' />
```


```react
<TeaserFeed kind='meta' format={{meta: {title: 'Format'}}}
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31.12.2017'},
  ]} />
```

```react
<TeaserFeed kind='meta' format={{meta: {title: 'Format'}}}
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31.12.2017'},
  ]}
  menu={<span>Test</span>}
 />
```

```react
<TeaserFeed format={{meta: {title: 'Format', color: 'purple', kind: 'meta'}}}
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31.12.2017'},
  ]} />
```

```react
<TeaserFeed kind='scribble'
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31.12.2017'},
  ]} />
```

```react
<TeaserFeed format={{meta: {title: 'Format', kind: 'scribble'}}}
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31.12.2017'},
  ]} />
```

Add an excerpt of the content using the highlight prop (if `highlightLabel` is omitted no label will be displayed).

```react
<TeaserFeed
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31.12.2017'},
  ]}
  focus
/>
```
