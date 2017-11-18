A `<Teaser />` is a preview of an article featuring headline, lead and credits.

Supported props:
- `format`: An optional format name which appears on top of the headline.
- `type`: An optional type `editorial`, `meta` or `social`.

```react
<Teaser>
  <TeaserHeadline.Editorial>The quick brown fox jumps over the lazy dog</TeaserHeadline.Editorial>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

```react
<Teaser format='Format'>
  <TeaserHeadline.Editorial>The quick brown fox jumps over the lazy dog</TeaserHeadline.Editorial>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

```react
<Teaser type='editorial' format='Format'>
  <TeaserHeadline.Editorial>The quick brown fox jumps over the lazy dog</TeaserHeadline.Editorial>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```


```react
<Teaser type='social' format='Format'>
  <TeaserHeadline.Editorial>The quick brown fox jumps over the lazy dog</TeaserHeadline.Editorial>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

```react
<Teaser type='meta' format='Format'>
  <TeaserHeadline.Interaction>The quick brown fox jumps over the lazy dog</TeaserHeadline.Interaction>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```

```react
<Teaser type='social' format='Format'>
  <TeaserHeadline.Interaction>The quick brown fox jumps over the lazy dog</TeaserHeadline.Interaction>
  <TeaserLead>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</TeaserLead>
  <TeaserCredit>An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017</TeaserCredit>
</Teaser>
```
