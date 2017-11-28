A `<PullQuote />` is a key phrase, quotation, or excerpt that has been pulled from an article and used as a graphic element. It typically contains a `<PullQuoteText />` and an optional `<PullQuoteSource />`.

Supported sizes:
- `regular` (default): Use full container width.
- `narrow`: Reduced max-width and centered.
- `breakout`: Use full container width and break out to the left.
- `float`: Break out to the left and let other elements flow around.

```react
<PullQuote>
  <PullQuoteText>
    «Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.»
  </PullQuoteText>
  <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
</PullQuote>
```

Add an `hasFigure` flag and use `<Figure />` to include an `<FigureImage />`.

```react
<PullQuote hasFigure>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <PullQuoteText>
    «Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.»
  </PullQuoteText>
  <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
</PullQuote>
```


### Sizes in context

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <PullQuote size={'narrow'}>
    <PullQuoteText>
      «Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.»
    </PullQuoteText>
    <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
  </PullQuote>
 <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <PullQuote hasFigure size={'narrow'}>
    <Figure>
      <FigureImage src='/static/landscape.jpg' alt='' />
      <FigureCaption>
        <FigureByline>Photo: Laurent Burst</FigureByline>
      </FigureCaption>
    </Figure>
    <PullQuoteText>
      «Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.»
    </PullQuoteText>
    <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
  </PullQuote>
 <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <PullQuote size={'breakout'}>
    <PullQuoteText>
      «Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.»
    </PullQuoteText>
    <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
  </PullQuote>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <PullQuote hasFigure size={'breakout'}>
    <Figure>
      <FigureImage src='/static/landscape.jpg' alt='' />
      <FigureCaption>
        <FigureByline>Photo: Laurent Burst</FigureByline>
      </FigureCaption>
    </Figure>
    <PullQuoteText>
      «Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.»
    </PullQuoteText>
    <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
  </PullQuote>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <PullQuote size={'float'}>
    <PullQuoteText>
      «Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.»
    </PullQuoteText>
    <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
  </PullQuote>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <PullQuote hasFigure size={'float'}>
    <Figure>
      <FigureImage src='/static/landscape.jpg' alt='' />
      <FigureCaption>
        <FigureByline>Photo: Laurent Burst</FigureByline>
      </FigureCaption>
    </Figure>
    <PullQuoteText>
      «Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.»
    </PullQuoteText>
    <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
  </PullQuote>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```
