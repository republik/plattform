A `<PullQuote />` is a key phrase, quotation, or excerpt that has been pulled from an article and used as a graphic element. It typically contains a `<PullQuoteText />` and an optional `<PullQuoteSource />`.

Supported sizes:
- `regular` (default): Use full container width.
- `narrow`: Reduced max-width and centered.
- `breakout`: Use full container width and break out to the left.
- `float`: Break out to the left and let other elements flow around.

```react
<PullQuote>
  <PullQuoteText>
    Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
  </PullQuoteText>
  <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
</PullQuote>
```

You can suppress quotation marks using `<PullQuoteText isQuoted={false} />`.

```react
<PullQuote>
  <PullQuoteText isQuoted={false}>
    Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
  </PullQuoteText>
  <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
</PullQuote>
```

Use `<PullQuoteFigure />` to include an `<Image />`. In this case, text and source must be wrapped inside `<PullQuoteBody />` which is optional otherwise.

```react
<PullQuote>
  <PullQuoteFigure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </PullQuoteFigure>
  <PullQuoteBody>
    <PullQuoteText>
      Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
    </PullQuoteText>
    <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
  </PullQuoteBody>
</PullQuote>
```


### Sizes in context

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <PullQuote size={'narrow'}>
    <PullQuoteBody>
      <PullQuoteText>
        Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
      </PullQuoteText>
      <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
    </PullQuoteBody>
  </PullQuote>
 <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <PullQuote size={'narrow'}>
    <PullQuoteFigure>
      <Image data={{src: '/static/landscape.jpg', alt: ''}} />
      <Caption>
        <Byline>Photo: Laurent Burst</Byline>
      </Caption>
    </PullQuoteFigure>
    <PullQuoteBody>
      <PullQuoteText>
        Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
      </PullQuoteText>
      <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
    </PullQuoteBody>
  </PullQuote>
 <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <PullQuote size={'breakout'}>
    <PullQuoteBody>
      <PullQuoteText>
        Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
      </PullQuoteText>
      <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
    </PullQuoteBody>
  </PullQuote>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <PullQuote size={'breakout'}>
    <PullQuoteFigure>
      <Image data={{src: '/static/landscape.jpg', alt: ''}} />
      <Caption>
        <Byline>Photo: Laurent Burst</Byline>
      </Caption>
    </PullQuoteFigure>
    <PullQuoteBody>
      <PullQuoteText>
        Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
      </PullQuoteText>
      <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
    </PullQuoteBody>
  </PullQuote>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <PullQuote size={'float'}>
    <PullQuoteBody>
      <PullQuoteText>
        Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
      </PullQuoteText>
      <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
    </PullQuoteBody>
  </PullQuote>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <PullQuote size={'float'}>
    <PullQuoteFigure>
      <Image data={{src: '/static/landscape.jpg', alt: ''}} />
      <Caption>
        <Byline>Photo: Laurent Burst</Byline>
      </Caption>
    </PullQuoteFigure>
    <PullQuoteBody>
      <PullQuoteText>
        Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
      </PullQuoteText>
      <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
    </PullQuoteBody>
  </PullQuote>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```
