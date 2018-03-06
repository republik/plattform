### `<BlockQuote />`

A `<BlockQuote />` contains a `<BlockQuoteContent />` which itself can contain an arbitrary number of `<Editorial.P />` blocks.

Optionally you can provide a `<FigureCaption />` to describe the quote source.


```react|responsive
<BlockQuote>
  <BlockQuoteContent>
    <Editorial.P>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin auctor felis tortor, at cursus metus interdum nec. Praesent tristique ante ut est ultrices, sed condimentum ipsum ullamcorper. Ut tempus vulputate cursus. Cras vitae varius sem. Fusce quis diam odio. Suspendisse ultrices est orci, quis ornare risus tempus ut. Morbi quis orci faucibus, aliquam nisl quis, pellentesque magna. Curabitur pellentesque nisi id ultricies efficitur. Cras facilisis volutpat purus eu viverra.
    </Editorial.P>
    <Editorial.P>
    Nunc a eleifend nulla, non condimentum felis. Vestibulum eu efficitur ex. Nunc egestas ullamcorper euismod. In odio nulla, posuere gravida faucibus et, rhoncus non purus. Cras eget justo sed dolor auctor suscipit. Quisque consequat tempus nisl. Curabitur a metus id mi varius vulputate. Nulla quis diam vitae elit scelerisque dapibus. Aliquam tincidunt sem nec nulla semper pulvinar. In posuere accumsan nunc vitae lacinia. Praesent et mollis elit. Proin quis massa feugiat augue dapibus convallis. Mauris sollicitudin libero non varius varius.
    </Editorial.P>
  </BlockQuoteContent>
  <FigureCaption>
    Dummy Text{' '}
    <FigureByline>lipsum.org</FigureByline>
  </FigureCaption>
</BlockQuote>
```
