A `<Tile />` is a tilelike front teaser that features an image on top of text, both centered.

Supported props:
- `image`: The URL of image.
- `color`: The text color.
- `bgColor`: The background color to use in stacked mode.

A `<SplitHeadline />` should be used.

A `<TileRow />` must be the parent of a `<Tile />`. It may contain a single tile, or 2 tiles side by side.

Supported props:
- `columns`: `1` (default), or `2`.


```react
<TileRow columns={2}>
  <Tile image='/static/rothaus_portrait.jpg'
    color='#fff' bgColor='#000'>
    <TileHeadline.Editorial>The fox</TileHeadline.Editorial>
    <FrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
    </FrontLead>
    <FrontCredit>
      An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
    </FrontCredit>
  </Tile>
  <Tile image='/static/rothaus_landscape.jpg'
    color='#000' bgColor='#adf'>
    <TileHeadline.Editorial>The quick brown fox</TileHeadline.Editorial>
    <FrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
    </FrontLead>
    <FrontCredit>
      An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
    </FrontCredit>
  </Tile>
</TileRow>
```

```react
<TileRow>
  <Tile image='/static/rothaus_portrait.jpg'
    color='#fff' bgColor='#000'>
    <TileHeadline.Editorial>The quick brown fox</TileHeadline.Editorial>
    <FrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
    </FrontLead>
    <FrontCredit>
      An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
    </FrontCredit>
  </Tile>
</TileRow>
```

```react
<TileRow>
  <Tile image='/static/rothaus_landscape.jpg'
    color='#fff' bgColor='#000'>
    <TileHeadline.Editorial>The quick fox</TileHeadline.Editorial>
    <FrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
    </FrontLead>
    <FrontCredit>
      An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
    </FrontCredit>
  </Tile>
</TileRow>
```
