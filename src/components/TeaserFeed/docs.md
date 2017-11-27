A `<TeaserFeed />` is a concise article teaser used in a feed context.

Supported props:
- `format`: An optional format name which appears on top of the headline.
- `type`: An optional type `editorial`, `meta` or `social`.

```react
<TeaserFeed>
  <TeaserFeedHeadline.Editorial>The quick brown fox jumps over the lazy dog</TeaserFeedHeadline.Editorial>
  <TeaserFeedLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserFeedLead>
  <TeaserFeedCredit>An article by <Editorial.A href='#'>Christof Moser</Editorial.A>, 31 December 2017</TeaserFeedCredit>
</TeaserFeed>
```

```react
<TeaserFeed format='Format'>
  <TeaserFeedHeadline.Editorial>The quick brown fox jumps over the lazy dog</TeaserFeedHeadline.Editorial>
  <TeaserFeedLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserFeedLead>
  <TeaserFeedCredit>An article by <Editorial.A href='#'>Christof Moser</Editorial.A>, 31 December 2017</TeaserFeedCredit>
</TeaserFeed>
```

```react
<TeaserFeed type='editorial' format='Format'>
  <TeaserFeedHeadline.Editorial>The quick brown fox jumps over the lazy dog</TeaserFeedHeadline.Editorial>
  <TeaserFeedLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserFeedLead>
  <TeaserFeedCredit>An article by <Editorial.A href='#'>Christof Moser</Editorial.A>, 31 December 2017</TeaserFeedCredit>
</TeaserFeed>
```


```react
<TeaserFeed type='social' format='Format'>
  <TeaserFeedHeadline.Editorial>The quick brown fox jumps over the lazy dog</TeaserFeedHeadline.Editorial>
  <TeaserFeedLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserFeedLead>
  <TeaserFeedCredit>An article by <Editorial.A href='#'>Christof Moser</Editorial.A>, 31 December 2017</TeaserFeedCredit>
</TeaserFeed>
```

```react
<TeaserFeed type='meta' format='Format'>
  <TeaserFeedHeadline.Interaction>The quick brown fox jumps over the lazy dog</TeaserFeedHeadline.Interaction>
  <TeaserFeedLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserFeedLead>
  <TeaserFeedCredit>An article by <Editorial.A href='#'>Christof Moser</Editorial.A>, 31 December 2017</TeaserFeedCredit>
</TeaserFeed>
```

```react
<TeaserFeed type='social' format='Format'>
  <TeaserFeedHeadline.Interaction>The quick brown fox jumps over the lazy dog</TeaserFeedHeadline.Interaction>
  <TeaserFeedLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserFeedLead>
  <TeaserFeedCredit>An article by <Editorial.A href='#'>Christof Moser</Editorial.A>, 31 December 2017</TeaserFeedCredit>
</TeaserFeed>
```
