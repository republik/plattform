### `<Figure />`

A `<Figure />` contains a `<FigureImage>` and an optional `<FigureCaption>`.

Properties

- `size` string, optional, `breakout`, `center` (for cover images)

```react
<Figure>
  <FigureImage src='/static/landscape.jpg' alt='' />
  <FigureCaption>
    Lorem ipsum dolor sit amet consetetur.{' '}
    <FigureByline>Photo: Laurent Burst</FigureByline>
  </FigureCaption>
</Figure>
```

#### Breakout example

```react|responsive
<Center style={{backgroundColor: 'red'}}>
  <Figure size='breakout'>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      Lorem ipsum dolor sit amet consetetur.{' '}
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
</Center>
```

#### `<FigureImage />`

The `<FigureImage>` component scales the image to 100% of the available space.

Properties

- `src` string, the image url, mandatory
- `alt` string, the alternative text

#### Placeholder

If `size` is provided or the `src` of a `<FigureImage />` includes `size` information in the query string, the image is wrapped in a placeholder that takes up the expected image size before the image is actually loaded. This is great to avoid jumpy layouting while the page loads.

```react|span-3
<Figure>
  <FigureImage
    src='/static/missing-file.jpg'
    size={{width: 974, height: 687}}
    alt='' />
  <FigureCaption>
    Placeholder from explicit size information.
  </FigureCaption>
</Figure>
```

```react|span-3
<Figure>
  <FigureImage
    src='/static/missing-file.jpg?size=974x687'
    alt='' />
  <FigureCaption>
    Placeholder from automatic size information.
  </FigureCaption>
</Figure>
```

#### Max Width

You may provide an `maxWidth`, e.g. the resolution of the file.

```react
<Figure>
  <FigureImage src='/static/profilePicture1.png' maxWidth={200} alt='' />
</Figure>
```

### `<FigureGroup />`

A `<FigureGroup />` arranges multiple `<Figure />` elements in columns. Use the `columns` prop to specify `2` to `4` columns, defaults to `2`. There's no auto-cropping magic in place, so image files should already be cropped to the same aspect ratio.

A `<FigureGroup />` containing two side-by-side `<Figure>` elements, each with their own caption:

```react
<FigureGroup>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      A caption for the left photo.{' '}
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      A caption for the right photo.{' '}
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
</FigureGroup>
```

A `<FigureGroup />` containing two side-by-side `<Figure>` elements, with one shared caption:

```react
<FigureGroup>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
  </Figure>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
  </Figure>
  <FigureCaption>
    This is an image caption stretching beautifully over both images as you can see above.{' '}
    <FigureByline>Photos: Laurent Burst</FigureByline>
  </FigureCaption>
</FigureGroup>
```

A `<FigureGroup />` containing three side-by-side `<Figure>` elements:
```react
<FigureGroup columns={3}>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      Left photo.{' '}
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      Center photo.{' '}
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      Right photo.{' '}
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
</FigureGroup>
```

A `<FigureGroup />` containing four side-by-side `<Figure>` elements:
```react
<FigureGroup columns={4}>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
</FigureGroup>
```

A `<FigureGroup />` containing four `<Figure>` elements in two columns:
```react
<FigureGroup>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <FigureCaption>
    This is a caption stretching beautifully across the group of all images as you can see above.
  </FigureCaption>
</FigureGroup>
```


#### `size`

Supports `breakout` sizes:

```react|responsive
<Center style={{backgroundColor: 'red'}}>
  <FigureGroup size='breakout'>
    <Figure>
      <FigureImage src='/static/landscape.jpg' alt='' />
    </Figure>
    <Figure>
      <FigureImage src='/static/landscape.jpg' alt='' />
    </Figure>
    <FigureCaption>
      This is an image caption stretching beautifully over both images as you can see above.{' '}
      <FigureByline>Photos: Laurent Burst</FigureByline>
    </FigureCaption>
  </FigureGroup>
</Center>
```
