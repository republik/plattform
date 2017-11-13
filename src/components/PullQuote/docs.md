A `<PullQuote />` is a key phrase, quotation, or excerpt that has been pulled from an article and used as a graphic element.

Supported props:
- `source`: The source or author of the quote.
- `isQuoted`: Suppress quotation marks by `isQuoted={false}`.
- `imageSrc`: An image.
- `textAlign`: The text alignment, `inherit` (default), `left`, `center` or `right`.
- `maxWidth`: The maximum width of the container.


```react
<PullQuote source='Thomas Jefferson'>
Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
</PullQuote>
```

```react
<PullQuote isQuoted={false}>
Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
</PullQuote>
```

```react
<PullQuote
 source='Thomas Jefferson'
 textAlign='center'
 maxWidth='495px'>
Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
</PullQuote>
```

```react
<PullQuote
 source='Thomas Jefferson'
 imageSrc='/static/profilePicture1.png'>
Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
</PullQuote>
```
