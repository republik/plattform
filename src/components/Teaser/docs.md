A `<Teaser />` is a container for an article's title elements like headline, lead and credits.

Supported props:
- `type`: `null` (default), `editorial`, `meta`, `social` or `social meta`.

```react
<Teaser>
  <TeaserFormat>Neutrum</TeaserFormat>
  <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

```react
<Teaser type='editorial'>
  <TeaserFormat>Neutrum</TeaserFormat>
  <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

```react
<Teaser type='meta'>
  <TeaserFormat>Neutrum</TeaserFormat>
  <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

```react
<Teaser type='social'>
  <TeaserFormat>Neutrum</TeaserFormat>
  <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

```react
<Teaser type='social meta'>
  <TeaserFormat>Neutrum</TeaserFormat>
  <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

### Teasers in context

```react
<Center>
  <Teaser>
    <TeaserFormat>Neutrum</TeaserFormat>
    <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
    <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
    <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
  </Teaser>
  <Teaser type='editorial'>
    <TeaserFormat>Neutrum</TeaserFormat>
    <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
    <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
    <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
  </Teaser>
  <Teaser type='meta'>
    <TeaserFormat>Neutrum</TeaserFormat>
    <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
    <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
    <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
  </Teaser>
  <Teaser type='social'>
    <TeaserFormat>Neutrum</TeaserFormat>
    <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
    <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
    <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
  </Teaser>
  <Teaser type='social meta'>
    <TeaserFormat>Neutrum</TeaserFormat>
    <TeaserHeadline>The quick brown fox jumps over the lazy dog</TeaserHeadline>
    <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
    <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
  </Teaser>
</Center>
```
