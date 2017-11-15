A `<TitleBlock />` is a container for an article's title elements like headline, lead and credits.

Supported props:
- `textAlign`: The text alignment, `inherit` (default), `left`, `center` or `right`.


```react
<TitleBlock>
  <Editorial.Format>Neutrum</Editorial.Format>
  <Editorial.Headline>The quick brown fox jumps over the lazy dog</Editorial.Headline>
  <Editorial.Lead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.
  </Editorial.Lead>
  <Editorial.Credit>
    An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017
  </Editorial.Credit>
</TitleBlock>
```

```react
<TitleBlock textAlign={'center'}>
  <Editorial.Format>Neutrum</Editorial.Format>
  <Editorial.Headline>The quick brown fox jumps over the lazy dog</Editorial.Headline>
  <Editorial.Lead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.
  </Editorial.Lead>
  <Editorial.Credit>
    An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017
  </Editorial.Credit>
</TitleBlock>
```

```react
<TitleBlock textAlign={'center'}>
  <Editorial.Format>Neutrum</Editorial.Format>
  <Interaction.Headline>The quick brown fox jumps over the lazy dog</Interaction.Headline>
  <Editorial.Lead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.
  </Editorial.Lead>
  <Editorial.Credit>
    An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017
  </Editorial.Credit>
</TitleBlock>
```
