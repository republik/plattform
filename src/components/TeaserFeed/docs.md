A `<TeaserFeed />` is a concise article teaser used in a feed context.

Supported props:
- `format`: An optional format which appears on top of the headline.
- `kind`: String `meta` or `editorial` 
- `color`: Color for top border and title
- `Link`, a Next.js like `<Link />` component
  This will be wrapped around links. You should attach an `onClick` handler within, if you wish to do client side routing and or prefetching. The component recieves following props:
  - `href` String, target url or path
  - `passHref` Boolean, indicates this will eventually end in an a tag and you may overwrite href

```react
<TeaserFeed
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31 December 2017'},
  ]} />
```

```react
<TeaserFeed format='Format'
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31 December 2017'},
  ]} />
```

```react
<TeaserFeed kind='editorial' format='Format'
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31 December 2017'},
  ]} />
```


```react
<TeaserFeed kind='editorialSocial' format='Format'
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31 December 2017'},
  ]} />
```

```react
<TeaserFeed kind='meta' format='Format'
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31 December 2017'},
  ]} />
```

```react
<TeaserFeed kind='metaSocial' format='Format'
  title='The quick brown fox jumps over the lazy dog'
  description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.'
  credits={[
    {type: 'text', value: 'An article by '},
    {type: 'link', url: 'https://republik.ch/~moser', children: [{type: 'text', value: 'Christof Moser'}]},
    {type: 'text', value: ', 31 December 2017'},
  ]} />
```
