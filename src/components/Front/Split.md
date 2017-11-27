A `<Split />` is a front teaser that features text and image side by side.

Supported props:
- `image`: The URL of image.
- `color`: The text color.
- `bgColor`: The background color to use in stacked mode.
- `portrait`: Whether to use the portrait layout.
- `reverse`: Whether the layout should be reversed (i.e. the image appears to the right).

A `<SplitHeadline />` should be used.

```react
<Split image='/static/rothaus_portrait.jpg'
  portrait
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <SplitHeadline.Editorial>Headline</SplitHeadline.Editorial>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</Split>
```

```react
<Split image='/static/rothaus_portrait.jpg'
  portrait reverse
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <SplitHeadline.Editorial>Headline</SplitHeadline.Editorial>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</Split>
```

```react
<Split image='/static/rothaus_landscape.jpg'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <SplitHeadline.Editorial>Headline</SplitHeadline.Editorial>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</Split>
```

```react
<Split image='/static/rothaus_landscape.jpg'
  reverse
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <SplitHeadline.Editorial>Headline</SplitHeadline.Editorial>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</Split>
```
