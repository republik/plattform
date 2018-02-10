## Email schema

```code|lang-jsx
import schema from '@project-r/styleguide/lib/templates/EditorialNewsletter/email'
```

The email schema uses table layout in container components.

`getPath`: `/YYYY/MM/DD/:slug`

### With cover image

```react|noSource
<Markdown schema={emailSchema}>{`

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

A caption. _Foto: Laurent Burst_

<hr /></section>

<section><h6>CENTER</h6>

Ladies and Gentlemen,

At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est _Lorem ipsum_ dolor sit amet. **Lorem ipsum** dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.

*   Sadipscing elitr
*   Lorem ipsum dolor sit amet
*   Diam voluptua

Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.

1.  Sadipscing elitr
2.  Lorem ipsum dolor sit amet
3.  Diam voluptua

## Ein Zwischentitel

Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

Das Rothaus _Foto: Laurent Burst_

<hr /></section>

Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.

<section><h6>QUOTE</h6>

Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.

Thomas Jefferson

<hr /></section>

Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat.

<hr /></section>

`}</Markdown>
```

### Without cover image

```react|noSource
<Markdown schema={emailSchema}>{`

<section><h6>CENTER</h6>

Ladies and Gentlemen,

At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. **Lorem ipsum** dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua ...

<hr /></section>

`}</Markdown>
```

## Web schema

```code|lang-jsx
import schema from '@project-r/styleguide/lib/templates/EditorialNewsletter/web'
```

The web schema reuses most of the email components, but uses web-specific container components without table layout and without header and footer.

### With cover image

```react|noSource
<Markdown schema={webSchema}>{`

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

A caption. _Foto: Laurent Burst_

<hr /></section>

<section><h6>CENTER</h6>

Ladies and Gentlemen,

At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. **Lorem ipsum** dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.

*   Sadipscing elitr
*   Lorem ipsum dolor sit amet
*   Diam voluptua

Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.

1.  Sadipscing elitr
2.  Lorem ipsum dolor sit amet
3.  Diam voluptua

## Ein Zwischentitel

Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

Das Rothaus _Foto: Laurent Burst_

<hr /></section>

Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.

<section><h6>QUOTE</h6>

Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.

Thomas Jefferson

<hr /></section>

Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat.

<hr /></section>

`}</Markdown>
```

### Without cover image

```react|noSource
<Markdown schema={webSchema}>{`

<section><h6>CENTER</h6>

Ladies and Gentlemen,

At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. **Lorem ipsum** dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua ...

<hr /></section>

`}</Markdown>
```
