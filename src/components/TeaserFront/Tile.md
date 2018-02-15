A `<TeaserFrontTile />` is a tilelike front page teaser that features an image on top of text, both centered.

Supported props:
- `image`: The URL of image.
- `color`: The text color.
- `bgColor`: The background color to use in stacked mode.
- `align`: `middle` (default), `top` or `bottom`.
- `onlyImage`: Whether to render only the image (full width or height).

A `<TeaserFrontTileHeadline />` should be used.

A `<TeaserFrontTileRow />` must be the parent of a `<TeaserFrontTile />`. It may contain a single tile, or 2 tiles side by side.

Supported props:
- `columns`: `1` (default), or `2`.


```react
<TeaserFrontTileRow columns={2}>
  <TeaserFrontTile image='/static/rothaus_portrait.jpg'
    byline='Foto: Laurent Burst'
    color='#fff' bgColor='#000'>
    <TeaserFrontTileHeadline.Editorial>The fox</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
    </TeaserFrontLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
  <TeaserFrontTile image='/static/rothaus_landscape.jpg'
    byline='Foto: Laurent Burst'
    color='#000' bgColor='#fff'>
    <TeaserFrontTileHeadline.Editorial>The quick brown fox</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
    </TeaserFrontLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```

```react
<TeaserFrontTileRow columns={2}>
  <TeaserFrontTile image='/static/rothaus_landscape.jpg'
    byline='Foto: Laurent Burst'
    color='#fff' bgColor='#000'>
    <TeaserFrontTileHeadline.Editorial>The quick brown fox</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
    </TeaserFrontLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
  <TeaserFrontTile color='#000' bgColor='#fff'>
    <Editorial.Format>Umfrage</Editorial.Format>
    <TeaserFrontTileHeadline.Interaction>Mehr Geld für ausländische Autorinnen oder einen Bundeshaus&shy;korrespondent?</TeaserFrontTileHeadline.Interaction>
    <TeaserFrontCredit>
      <TeaserFrontCreditLink href='#'>Constantin Seibt</TeaserFrontCreditLink> fragt nach<br />31. December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```

```react
<TeaserFrontTileRow>
  <TeaserFrontTile image='/static/rothaus_portrait.jpg' byline='Foto: Laurent Burst' color='#fff' bgColor='#000'>
    <TeaserFrontTileHeadline.Editorial>The quick brown fox</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
    </TeaserFrontLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#' color='#fba'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```

```react
<TeaserFrontTileRow>
  <TeaserFrontTile image='/static/rothaus_landscape.jpg' byline='Foto: Laurent Burst' color='#fff' bgColor='#000'>
    <TeaserFrontTileHeadline.Editorial>The quick fox</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
    </TeaserFrontLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#' color='#fba'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```

```react
<TeaserFrontTileRow>
  <TeaserFrontTile byline='Foto: Laurent Burst' color='#000' bgColor='#fff'>
    <Editorial.Format>Umfrage</Editorial.Format>
    <TeaserFrontTileHeadline.Interaction>Mehr Geld für ausländische Autorinnen oder einen Bundeshaus&shy;korrespondent?</TeaserFrontTileHeadline.Interaction>
    <TeaserFrontCredit>
      <TeaserFrontCreditLink href='#'>Constantin Seibt</TeaserFrontCreditLink> fragt nach<br />31. December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```

### Aligning items

```react
<TeaserFrontTileRow columns={2}>
  <TeaserFrontTile align='top' image='/static/rothaus_landscape.jpg' byline='Foto: Laurent Burst' color='#000' bgColor='#fff'>
    <TeaserFrontTileHeadline.Editorial>Short headline</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
  <TeaserFrontTile
    align='top'
    byline='Foto: Laurent Burst'
    image='/static/rothaus_landscape.jpg'
    color='#000' bgColor='#fff'>
    <TeaserFrontTileHeadline.Editorial>An article which deserves top-alignment</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```

```react
<TeaserFrontTileRow columns={2}>
  <TeaserFrontTile image='/static/rothaus_landscape.jpg'
    byline='Foto: Laurent Burst'
    color='#000' bgColor='#fff'>
    <TeaserFrontTileHeadline.Editorial>Short headline</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
  <TeaserFrontTile
    align='bottom'
    byline='Foto: Laurent Burst' color='#000' bgColor='#fff'>
    <TeaserFrontTileHeadline.Editorial>Short headline</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```

### Image only

```react
<TeaserFrontTileRow columns={2}>
  <TeaserFrontTile onlyImage image='/static/dada.jpg' bgColor='#fff'>
    <TeaserFrontTileHeadline.Editorial>Unrendered headline</TeaserFrontTileHeadline.Editorial>
  </TeaserFrontTile>
  <TeaserFrontTile image='/static/rothaus_landscape.jpg' byline='Foto: Laurent Burst'
    color='#fff' bgColor='#000'>
    <TeaserFrontTileHeadline.Editorial>Headline</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```

```react
<TeaserFrontTileRow columns={2}>
  <TeaserFrontTile onlyImage image='/static/video.jpg' bgColor='#000'>
    <TeaserFrontTileHeadline.Editorial>Unrendered headline</TeaserFrontTileHeadline.Editorial>
  </TeaserFrontTile>
  <TeaserFrontTile image='/static/rothaus_portrait.jpg' byline='Foto: Laurent Burst'
    color='#000' bgColor='#fff'>
    <TeaserFrontTileHeadline.Editorial>Headline</TeaserFrontTileHeadline.Editorial>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```

```react
<TeaserFrontTileRow>
  <TeaserFrontTile onlyImage image='/static/video.jpg'>
    <TeaserFrontTileHeadline.Editorial>Unrendered headline</TeaserFrontTileHeadline.Editorial>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```
