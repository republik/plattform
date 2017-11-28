A `<TeaserFrontTypo />` is a front page teaser that features big typographic text without any image.

Supported props:
- `color`: The text color.
- `bgColor`: The background color to use in stacked mode.

A `<TeaserFrontTypoHeadline />` should be used. The default font size can be bumped with either of these props:
- `medium`: Whether the font size shoud be increased to medium.
- `large`: Whether the font size shoud be increased to large.

```react
<TeaserFrontTypo bgColor='#fc9'>
  <TeaserFrontTypoHeadline.Editorial>The quick brown fox</TeaserFrontTypoHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontAuthorLink href='#'>Christof Moser</TeaserFrontAuthorLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontTypo>
```

```react
<TeaserFrontTypo bgColor='#fc9'>
  <TeaserFrontTypoHeadline.Editorial medium>The quick fox</TeaserFrontTypoHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontAuthorLink href='#'>Christof Moser</TeaserFrontAuthorLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontTypo>
```

```react
<TeaserFrontTypo bgColor='#fc9'>
  <TeaserFrontTypoHeadline.Editorial large>The Fox</TeaserFrontTypoHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontAuthorLink href='#'>Christof Moser</TeaserFrontAuthorLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontTypo>
```

```react
<TeaserFrontTypo color='#fc9' bgColor='#000' >
  <TeaserFrontTypoHeadline.Interaction>The quick brown fox</TeaserFrontTypoHeadline.Interaction>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontAuthorLink href='#'>Christof Moser</TeaserFrontAuthorLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontTypo>
```

```react
<TeaserFrontTypo color='#fc9' bgColor='#000' >
  <TeaserFrontTypoHeadline.Interaction medium>The quick fox</TeaserFrontTypoHeadline.Interaction>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontAuthorLink href='#'>Christof Moser</TeaserFrontAuthorLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontTypo>
```

```react
<TeaserFrontTypo color='#fc9' bgColor='#000' >
  <TeaserFrontTypoHeadline.Interaction large>The Fox</TeaserFrontTypoHeadline.Interaction>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontAuthorLink href='#'>Christof Moser</TeaserFrontAuthorLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontTypo>
```
