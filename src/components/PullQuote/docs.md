A `<PullQuote />` is a key phrase, quotation, or excerpt that has been pulled from an article and used as a graphic element. It typically contains a `<PullQuoteText />` and an optional `<PullQuoteSource />`.

Supported props:
- `textAlign`: The text alignment, `inherit` (default), `left`, `center` or `right`.
- `size`: `narrow`

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

```react
<PullQuote
 textAlign='center'
 size='narrow'>
  <PullQuoteText>
    Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
  </PullQuoteText>
  <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
</PullQuote>
```

Use `<PullQuoteFigure />` to include an `<Image />`. In this case, text and source must be wrapped inside `<PullQuoteBody />` which is optional otherwise.

```react
<PullQuote>
  <PullQuoteFigure>
    <Image src='/static/profilePicture1.png' alt='' />
    <Editorial.Caption>
      <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
    </Editorial.Caption>
  </PullQuoteFigure>
  <PullQuoteBody>
    <PullQuoteText>
      Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
    </PullQuoteText>
    <PullQuoteSource>Thomas Jefferson</PullQuoteSource>
  </PullQuoteBody>
</PullQuote>
```
