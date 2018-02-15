A `<TeaserFrontImage />` is a front page teaser that features text on top of an image on wide screens, and stacks the text under the image on narrow screens.

Supported props:
- `image`: The URL of image.
- `textPosition`: `topleft` (default), `topright`, `bottomleft`, `bottomright`, `top`, `middle` or `bottom`.
- `color`: The text color.
- `bgColor`: The background color to use in stacked mode.
- `center`: Whether the text should be center aligned.

A `<TeaserFrontImageHeadline />` should be used. The default font size can be changed with either of these props:
- `medium`: Whether the font size shoud be increased to medium.
- `large`: Whether the font size shoud be increased to large.
- `small`: Whether the font size should be decreased to small.

```react
<TeaserFrontImage
  image='/static/desert.jpg?size=4323x2962' byline='Foto: Bildagentur'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial small>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#adf'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Bildagentur'
  textPosition='topright'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial small>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#adf'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Bildagentur'
  textPosition='bottomleft'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial small>The sand</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#adf'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Bildagentur'
  textPosition='bottomright'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial small>The sand</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#adf'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Bildagentur'
  center
  textPosition='topright' 
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial small>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#adf'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Bildagentur'
  textPosition='topright'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Interaction small>The sand is near</TeaserFrontImageHeadline.Interaction>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#adf'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Bildagentur'
  center
  textPosition='top'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#adf'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Bildagentur'
  center
  textPosition='middle'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#adf'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Bildagentur'
  center
  textPosition='bottom'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#adf'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Bildagentur'
  center
  textPosition='middle'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial medium>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#adf'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

```react
<TeaserFrontImage image='/static/desert.jpg' byline='Foto: Bildagentur'
  center
  textPosition='middle'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial large>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink href='#' color='#adf'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>
```

Photo by Thomas Vuillemin on [Unsplash](https://unsplash.com/photos/c1_K8Qfd_iQ)
