### `<Figure />`

A `<Figure />` typically contains an `<Image>` and an optional `<Editorial.Caption>`. The `<Image>` component makes sure that the image doesn't exceed the container width when using a large image.


```react
<Figure>
  <Image src='/static/landscape.jpg' alt='' />
  <Editorial.Caption>
    Lorem ipsum dolor sit amet consetetur.{' '}
    <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
  </Editorial.Caption>
</Figure>
```

### `<FigureGroup />`

A `<FigureGroup />` contains multiple `<Figure />` elements. Note that currently up to four side-by-side `<Figure />` elements are supported. There's no auto-cropping magic in place, so side-by-side image files should already be cropped to the same aspect ratio.

A `<FigureGroup />` containing two side-by-side `<Figure>` elements, each with their own caption:

```react
<FigureGroup>
  <Figure>
    <Image src='/static/landscape.jpg' alt='' />
    <Editorial.Caption>
      A caption for the left photo.{' '}
      <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
    </Editorial.Caption>
  </Figure>
  <Figure>
    <Image src='/static/landscape.jpg' alt='' />
    <Editorial.Caption>
      A caption for the right photo.{' '}
      <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
    </Editorial.Caption>
  </Figure>
</FigureGroup>
```

A `<FigureGroup />` containing two side-by-side `<Figure>` elements, with one shared caption:
```react
<FigureGroup>
  <Figure>
    <Image src='/static/landscape.jpg' alt='' />
  </Figure>
  <Figure>
    <Image src='/static/landscape.jpg' alt='' />
  </Figure>
  <Editorial.Caption>
    This is an image caption stretching beautifully over both images as you can see above.{' '}
    <Editorial.Byline>Photos: Laurent Burst</Editorial.Byline>
  </Editorial.Caption>
</FigureGroup>
```

```react
<FigureGroup>
  <Figure>
    <Image src='/static/landscape.jpg' alt='' />
    <Editorial.Caption>
      Left photo.{' '}
      <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
    </Editorial.Caption>
  </Figure>
  <Figure>
    <Image src='/static/landscape.jpg' alt='' />
    <Editorial.Caption>
      Center photo.{' '}
      <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
    </Editorial.Caption>
  </Figure>
  <Figure>
    <Image src='/static/landscape.jpg' alt='' />
    <Editorial.Caption>
      Right photo.{' '}
      <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
    </Editorial.Caption>
  </Figure>
</FigureGroup>
```

```react
<FigureGroup>
  <Figure>
    <Image src='/static/landscape.jpg' alt='' />
    <Editorial.Caption>
      <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
    </Editorial.Caption>
  </Figure>
  <Figure>
    <Image src='/static/landscape.jpg' alt='' />
    <Editorial.Caption>
      <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
    </Editorial.Caption>
  </Figure>
  <Figure>
    <Image src='/static/landscape.jpg' alt='' />
    <Editorial.Caption>
      <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
    </Editorial.Caption>
  </Figure>
  <Figure>
    <Image src='/static/landscape.jpg' alt='' />
    <Editorial.Caption>
      <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
    </Editorial.Caption>
  </Figure>
</FigureGroup>
```
