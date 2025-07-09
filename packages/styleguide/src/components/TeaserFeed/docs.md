A `<TeaserFeed />` is a concise article teaser used in a feed context.

Supported props:

- `format`: An optional format which appears on top of the headline.
- `series`: An optinal series with episodes, will appear on top of the headline unless it's the started epsiode.
- `repoId`: An optional repo id to help detect the right series episode when paths do not suffice
- `kind`: String `meta` or `editorial` (default)
- `color`: Color for top border and title
- `Link`, a Next.js like `<Link />` component
  This will be wrapped around links. You should attach an `onClick` handler within, if you wish to do client side
  routing and or prefetching. The component recieves following props:
  - `href` String, target url or path
  - `passHref` Boolean, indicates this will eventually end in an a tag and you may overwrite href
- `bar`: an optional React element for actions.
- `prepublication`: Whether the teaser is for a prepublished article.
- `menu`: callout menu
- `highlighted`: highlights the teaser

Data props:

- `path`
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

With callout menu:

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
  highlight='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  highlightLabel='My highlight'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31.12.2017'},
  ]}
/>
```

### Highlighted

```react
<TeaserFeed
    title='The quick brown fox jumps over the lazy dog'
    description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
    credits={[
      {type: 'text', value: 'An article by '},
      {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
      {type: 'text', value: ', 31.12.2017'},
    ]}
    highlighted
/>
```

### Series

_TBD: Format lines for series are currently disabled._

```react
<TeaserFeed series={{title: 'Die Serie', episodes: [{ label: 'Auftakt', document: { meta: { path: '#auftakt'}}}, { label: 'Folge 1', document: { meta: { path: '#folge-1'}}}]}}
  path='#auftakt'
  title='Die Serie'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'Von '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 04.02.2021'},
  ]}
  t={t}
/>
```

```react
<TeaserFeed series={{title: 'Die Serie', episodes: [{ label: 'Auftakt', document: { meta: { path: '#auftakt'}}}, { label: 'Folge 1', document: { meta: { path: '#folge-1'}}}]}}
  path='#folge-1'
  title='War es Mord?'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'Von '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 04.02.2021'},
  ]}
  t={t}
/>
```

For legacy purposes we back off if the title contains the series title:

```react
<TeaserFeed series={{title: 'Die Serie', episodes: [{ label: 'Auftakt', document: { meta: { path: '#auftakt'}}}, { label: 'Folge 1', document: { meta: { path: '#folge-1'}}}]}}
  path='#folge-1'
  title='Die Serie, Folge 1: War es Mord?'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'Von '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 04.02.2021'},
  ]}
  t={t}
/>
```

### Non-interactive version

This renders the teaser-feed without any clickable links.

```react
<TeaserFeed kind='meta' format={{meta: {title: 'Format'}}}
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31.12.2017'},
  ]}
  nonInteractive
 />
```
