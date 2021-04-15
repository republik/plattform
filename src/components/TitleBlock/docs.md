A `<TitleBlock />` is a container for an article's title elements like headline, lead and credits.

Supported props:
- `center`: bool, large centered title block


```react
<TitleBlock>
  <Editorial.Format>Neutrum</Editorial.Format>
  <Editorial.Headline>The quick brown fox jumps over the lazy dog</Editorial.Headline>
  <Editorial.Lead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.
  </Editorial.Lead>
  <Editorial.Credit>
    An article by <Editorial.A href='#'>Christof Moser</Editorial.A>, 31 December 2017
  </Editorial.Credit>
</TitleBlock>
```

```react
<TitleBlock>
  <TeaserFrontLogo logo='/static/50Jahre_Frauenwahlrecht_positiv.svg' logoDark='/static/50Jahre_Frauenwahlrecht_negativ.svg' alt='50 Jahre Frauenstimmrecht'/>
  <Editorial.Format>50 Jahre Frauenstimmrecht</Editorial.Format>
  <Editorial.Headline>The quick brown fox jumps over the lazy dog</Editorial.Headline>
  <Editorial.Lead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.
  </Editorial.Lead>
  <Editorial.Credit>
    An article by <Editorial.A href='#'>Christof Moser</Editorial.A>, 31 December 2017
  </Editorial.Credit>
</TitleBlock>
```

```react
<TitleBlock center>
  <Editorial.Format>Neutrum</Editorial.Format>
  <Editorial.Headline>The quick brown fox jumps over the lazy dog</Editorial.Headline>
  <Editorial.Lead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.
  </Editorial.Lead>
  <Editorial.Credit>
    An article by <Editorial.A href='#'>Christof Moser</Editorial.A>, 31 December 2017
  </Editorial.Credit>
</TitleBlock>
```

```react
<TitleBlock center>
  <Editorial.Format>Neutrum</Editorial.Format>
  <Interaction.Headline>The quick brown fox jumps over the lazy dog</Interaction.Headline>
  <Editorial.Lead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.
  </Editorial.Lead>
  <Editorial.Credit>
    An article by <Editorial.A href='#'>Christof Moser</Editorial.A>, 31 December 2017
  </Editorial.Credit>
</TitleBlock>
```

```react
<TitleBlock center>
  <Editorial.Format>Neutrum</Editorial.Format>
  <Scribble.Headline>The quick brown fox jumps over the lazy dog</Scribble.Headline>
  <Editorial.Lead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.
  </Editorial.Lead>
  <Editorial.Credit>
    An article by <Editorial.A href='#'>Christof Moser</Editorial.A>, 31 December 2017
  </Editorial.Credit>
</TitleBlock>
```
