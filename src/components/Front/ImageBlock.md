An `<ImageBlock />` is a front teaser that features text on top of an image on wide screens, and stacks the text under the image on narrow screens.

Supported props:
- `image`: The URL of image.
- `textPosition`: `topleft` (default), `topright`, `bottomleft` or `bottomright`.
- `color`: The text color.
- `bgColor`: The background color to use in stacked mode.
- `center`: Whether the text should be center aligned.

An `<ImageBlockHeadline />` should be used.

```react
<ImageBlock
  image='/static/rothaus_landscape.jpg'
  color='#adf' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <ImageBlockHeadline.Editorial>The quick brown fox</ImageBlockHeadline.Editorial>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</ImageBlock>
```

```react
<ImageBlock image='/static/rothaus_landscape.jpg'
  textPosition='topright'
  color='#adf' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <ImageBlockHeadline.Editorial>The quick brown fox</ImageBlockHeadline.Editorial>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</ImageBlock>
```

```react
<ImageBlock image='/static/rothaus_landscape.jpg'
  textPosition='bottomleft'
  color='#adf' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <ImageBlockHeadline.Editorial>The quick fox</ImageBlockHeadline.Editorial>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</ImageBlock>
```

```react
<ImageBlock image='/static/rothaus_landscape.jpg'
  textPosition='bottomright'
  color='#adf' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <ImageBlockHeadline.Editorial>The quick fox</ImageBlockHeadline.Editorial>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</ImageBlock>
```

```react
<ImageBlock image='/static/rothaus_landscape.jpg'
  center
  textPosition='topright' 
  color='#adf' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <ImageBlockHeadline.Editorial>The quick brown fox</ImageBlockHeadline.Editorial>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</ImageBlock>
```

```react
<ImageBlock image='/static/rothaus_landscape.jpg'
  textPosition='topright'
  color='#adf' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <ImageBlockHeadline.Interaction>The quick brown fox</ImageBlockHeadline.Interaction>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</ImageBlock>
```
