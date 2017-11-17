A `<Teaser />` is a preview of an article featuring headline, lead and credits.

Supported props:
- `format`: An optional format name which appears on top of the headline.
- `type`: `null` (default), `editorial`, `meta` or `social`.
- `interaction`: Whether the teaser represents an interaction rather than editorial content. True by default for `meta` and `social` types, but there might be situations where you want to turn off that default style.

```react
<Teaser>
  <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

```react
<Teaser format='Format'>
  <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

```react
<Teaser type='editorial' format='Format'>
  <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

```react
<Teaser type='meta' format='Format'>
  <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

```react
<Teaser type='social' format='Format'>
  <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

```react
<Teaser type='social' format='Format' interaction={false}>
  <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

### Teasers in context

```react
<Center>
  <Teaser>
    <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
    <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
    <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
  </Teaser>
  <Teaser format='Format'>
    <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
    <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
    <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
  </Teaser>
  <Teaser type='editorial' format='Format'>
    <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
    <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
    <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
  </Teaser>

  <Teaser type='meta' format='Format'>
    <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
    <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
    <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
  </Teaser>
  <Teaser type='social' format='Format'>
    <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
    <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
    <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
  </Teaser>
  <Teaser type='social' format='Format' interaction={false}>
    <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
    <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
    <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
  </Teaser>
</Center>
```
