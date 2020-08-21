A `<TeaserFrontImage />` is a front page teaser that features text on top of an image on wide screens, and stacks the text under the image on narrow screens.

Supported props:
- `image`: The URL of image.
- `textPosition`: `topleft` (default), `topright`, `bottomleft`, `bottomright`, `top`, `middle` or `bottom`.
- `color`: The text color.
- `bgColor`: The background color to use in stacked mode.
- `center`: Whether the text should be center aligned.
- `onlyImage`: Whether to render only the image (without the text block).
- `maxWidth`: useful for e.g. gifs that have solid color edges, see example below

A `<TeaserFrontImageHeadline />` should be used. The default font size can be changed with either of these props:d
- `medium`: Whether the font size shoud be increased to medium.
- `large`: Whether the font size shoud be increased to large.
- `small`: Whether the font size should be decreased to small.


## `textPosition`

### `topleft` (default)

```react
<TeaserFrontImage
  image='/static/desert.jpg?size=4323x2962' byline='Foto: Thomas Vuillemin'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial small>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

### `topright`

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Thomas Vuillemin'
  textPosition='topright'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial small>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

### `bottomleft`

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Thomas Vuillemin'
  textPosition='bottomleft'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial small>The sand</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

### `bottomright`

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Thomas Vuillemin'
  textPosition='bottomright'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial small>The sand</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

### `topright`

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Thomas Vuillemin'
  center
  textPosition='topright' 
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial small>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

### `top`

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Thomas Vuillemin'
  center
  textPosition='top'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

### `middle`

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Thomas Vuillemin'
  center
  textPosition='middle'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

### `bottom`

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Thomas Vuillemin'
  center
  textPosition='bottom'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

### `underneath`

Always underneath, even on big screens.

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Thomas Vuillemin'
  center
  textPosition='underneath'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

## `titleSize`

### `medium`

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Thomas Vuillemin'
  center
  textPosition='middle'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial medium>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

### `large`

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Thomas Vuillemin'
  center
  textPosition='middle'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial large>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

### `small`

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Thomas Vuillemin'
  textPosition='bottomright'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial small>LongWordOverflowingLongWordOverflowing</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

## `onlyImage`

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Thomas Vuillemin'
  center
  onlyImage
  textPosition='topright' 
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial small>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

## `feuilleton`

Horizontal `feuilleton` margins and regular text color in stacked mode.

```react
<TeaserFrontImage
  feuilleton
  image='/static/desert.jpg?size=4323x2962' byline='Foto: Thomas Vuillemin'
  color='#fff' collapsedColor='#000' bgColor='#fff'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial small>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

Photo by Thomas Vuillemin on [Unsplash](https://unsplash.com/photos/c1_K8Qfd_iQ)

## Animated SVG

```react
<TeaserFrontImage
  image='/static/skilifte-front.svg?size=360x275' color='#fff' bgColor='#000'>
  <TeaserFrontImageHeadline.Editorial small>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#fff'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

## `maxWidth`

```react
<TeaserFrontImage image='/static/im-gespr-3.gif'
  center
  textPosition='underneath'
  maxWidth={600}
  color='#6EF7E0' bgColor='#000'>
  <Editorial.Format>Im Gespräch, Folge 3</Editorial.Format>
  <TeaserFrontCredit>
    Von Roger de Weck, 07.08.2020
  </TeaserFrontCredit>
</TeaserFrontImage>
```

