An `<TypoBlock />` is a front teaser that features big bold text without any image.

Supported props:
- `color`: The text color.
- `bgColor`: The background color to use in stacked mode.

A `<TypoBlockHeadline />` should be used. The default font size can be bumped with either of these props:
- `medium`: Whether the font size shoud be increased to medium.
- `large`: Whether the font size shoud be increased to large.

```react
<TypoBlock bgColor='#fc9'>
  <TypoBlockHeadline.Editorial>The quick brown fox</TypoBlockHeadline.Editorial>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</TypoBlock>
```

```react
<TypoBlock bgColor='#fc9'>
  <TypoBlockHeadline.Editorial medium>The quick fox</TypoBlockHeadline.Editorial>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</TypoBlock>
```

```react
<TypoBlock bgColor='#fc9'>
  <TypoBlockHeadline.Editorial large>The Fox</TypoBlockHeadline.Editorial>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</TypoBlock>
```

```react
<TypoBlock color='#fc9' bgColor='#000' >
  <TypoBlockHeadline.Interaction>The quick brown fox</TypoBlockHeadline.Interaction>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</TypoBlock>
```

```react
<TypoBlock color='#fc9' bgColor='#000' >
  <TypoBlockHeadline.Interaction medium>The quick fox</TypoBlockHeadline.Interaction>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</TypoBlock>
```

```react
<TypoBlock color='#fc9' bgColor='#000' >
  <TypoBlockHeadline.Interaction large>The Fox</TypoBlockHeadline.Interaction>
  <FrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </FrontLead>
  <FrontCredit>
    An article by <FrontAuthorLink href='#'>Christof Moser</FrontAuthorLink>, 31 December 2017
  </FrontCredit>
</TypoBlock>
```
