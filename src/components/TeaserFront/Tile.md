A `<TeaserFrontTile />` is a tilelike front page teaser that features an image on top of text, both centered.

Supported props:
- `image`: The URL of image.
- `color`: The text color.
- `bgColor`: The background color to use in stacked mode.

A `<TeaserFrontTileHeadline />` should be used.

A `<TeaserFrontTileRow />` must be the parent of a `<TeaserFrontTile />`. It may contain a single tile, or 2 tiles side by side.

Supported props:
- `columns`: `1` (default), or `2`.


```react
<TeaserFrontTileRow columns={2}>
  <TeaserFrontTile image='/static/rothaus_portrait.jpg'
    color='#fff' bgColor='#000'>
    <TeaserFrontTileHeadline.Editorial>The fox</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
    </TeaserFrontLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontAuthorLink href='#'>Christof Moser</TeaserFrontAuthorLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
  <TeaserFrontTile image='/static/rothaus_landscape.jpg'
    color='#000' bgColor='#fff'>
    <TeaserFrontTileHeadline.Editorial>The quick brown fox</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
    </TeaserFrontLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontAuthorLink href='#'>Christof Moser</TeaserFrontAuthorLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```

```react
<TeaserFrontTileRow columns={2}>
  <TeaserFrontTile image='/static/rothaus_landscape.jpg'
    color='#fff' bgColor='#000'>
    <TeaserFrontTileHeadline.Editorial>The quick brown fox</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
    </TeaserFrontLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontAuthorLink href='#'>Christof Moser</TeaserFrontAuthorLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
  <TeaserFrontTile color='#000' bgColor='#fff'>
    <Editorial.Format>Umfrage</Editorial.Format>
    <TeaserFrontTileHeadline.Interaction>Mehr Geld für ausländische Autorinnen oder einen Bundeshaus&shy;korrespondent?</TeaserFrontTileHeadline.Interaction>
    <TeaserFrontCredit>
      <TeaserFrontAuthorLink href='#'>Constantin Seibt</TeaserFrontAuthorLink> fragt nach<br />31. December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```

```react
<TeaserFrontTileRow>
  <TeaserFrontTile image='/static/rothaus_portrait.jpg'
    color='#fff' bgColor='#000'>
    <TeaserFrontTileHeadline.Editorial>The quick brown fox</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
    </TeaserFrontLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontAuthorLink href='#' color='#fba'>Christof Moser</TeaserFrontAuthorLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```

```react
<TeaserFrontTileRow>
  <TeaserFrontTile image='/static/rothaus_landscape.jpg'
    color='#fff' bgColor='#000'>
    <TeaserFrontTileHeadline.Editorial>The quick fox</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
    </TeaserFrontLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontAuthorLink href='#' color='#fba'>Christof Moser</TeaserFrontAuthorLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```

```react
<TeaserFrontTileRow>
  <TeaserFrontTile color='#000' bgColor='#fff'>
    <Editorial.Format>Umfrage</Editorial.Format>
    <TeaserFrontTileHeadline.Interaction>Mehr Geld für ausländische Autorinnen oder einen Bundeshaus&shy;korrespondent?</TeaserFrontTileHeadline.Interaction>
    <TeaserFrontCredit>
      <TeaserFrontAuthorLink href='#'>Constantin Seibt</TeaserFrontAuthorLink> fragt nach<br />31. December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```
