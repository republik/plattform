## Email schema

```code|lang-jsx
import createEmailSchema from '@project-r/styleguide/lib/templates/EditorialNewsletter/email'
```

The email schema uses table layout in container components.

`getPath`: `/YYYY/MM/DD/:slug`

### With cover image

```react|noSource
<Markdown schema={createEmailSchema()}>{`

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

A caption. _Foto: Laurent Burst_

<hr /></section>

<section><h6>CENTER</h6>

Ladies and Gentlemen and everyone beyond

At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est _Lorem ipsum_ dolor sit amet. **Lorem ipsum** dolor _**sit amet**_, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.

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

## Ein Chart

Weit hinten, hinter den Wortbergen, fern der Länder Vokalien und Konsonantien leben die Blindtexte. Abgeschieden wohnen sie in Buchstabhausen an der Küste des Semantik, eines grossen Sprachozeans.

<section><h6>FIGURE</h6>

\`\`\`
{"plain": true}
\`\`\`

![](/static/nl-chart.png?size=1318x540)

Neue Spitaleinweisungen; gleitender Mittelwert über 7 Tage. Die Daten nach dem 13. November sind vermutlich noch unvollständig, deshalb haben wir sie nicht berücksichtigt. Stand: 20.11.2020. Quelle: Bundesamt für Gesundheit.

<hr /></section>

Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.

<section><h6>QUOTE</h6>

Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.

Thomas Jefferson

<hr /></section>

<section><h6>BUTTON</h6>

\`\`\`
{"primary": true}
\`\`\`

[Call to action](#nox-an-der-langstrasse "Zur Sektion springen")

<hr /></section>

<section><h6>BUTTON</h6>

[No thanks!](/devnull "Ins nichts")

<hr /></section>

Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat.

<hr /></section>

`}</Markdown>
```

### Without cover image

```react|noSource
<Markdown schema={createEmailSchema()}>{`

<section><h6>CENTER</h6>

Ladies and Gentlemen

At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. **Lorem ipsum** dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua ...

<hr /></section>

`}</Markdown>
```

### With Covid-19 Logo

```react|noSource
<Markdown schema={createEmailSchema()} rootData={{
  "meta": {
    "format": {
      "repoId": "republik/format-covid-19-uhr-newsletter",
      "meta": {
        "title": "Covid-19-Uhr-Newsletter",
        "path": "/format/covid-19-uhr-newsletter",
        "kind": "meta",
        "color": "#d44438"
      }
    }
  }
}}>{`
<section><h6>CENTER</h6>

Liebe Leserinnen, liebe Leser

At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. **Lorem ipsum** dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua ...

Bleiben Sie umsichtig, bleiben Sie freundlich, bleiben Sie gesund.

Philipp Albrecht, Elia Blülle, Dennis Bühler, Oliver Fuchs und Cinzia Venafro

**PS:** Haben Sie Fragen und Feedback, schreiben Sie an: covid19@republik.ch.

<hr /></section>

`.trim()}</Markdown>
```

For compatibility reasons we also support the showing the covid logo with just the format repo url:

```react|noSource
<Markdown schema={createEmailSchema()}>{`
\-\-\-
format: 'https://github.com/republik/format-covid-19-uhr-newsletter'
\-\-\-

<section><h6>CENTER</h6>

Liebe Leserinnen, liebe Leser

At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. **Lorem ipsum** dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua ...

Bleiben Sie umsichtig, bleiben Sie freundlich, bleiben Sie gesund.

Philipp Albrecht, Elia Blülle, Dennis Bühler, Oliver Fuchs und Cinzia Venafro

**PS:** Haben Sie Fragen und Feedback, schreiben Sie an: covid19@republik.ch.

<hr /></section>

`.trim()}</Markdown>
```

### With Project R Newsletter Formatting

```react|noSource
<Markdown schema={createEmailSchema()} rootData={{
  "meta": {
    "format": {
      "repoId": "republik/format-project-r-newsletter",
      "meta": {
        "title": "Project-R-Newsletter",
        "path": "/format/project-r-newsletter",
        "kind": "meta",
        "color": "#d44438"
      }
    }
  }
}}>{`
<section><h6>CENTER</h6>

Liebe Leserinnen, liebe Leser

At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. **Lorem ipsum** dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua ...

Bleiben Sie umsichtig, bleiben Sie freundlich, bleiben Sie gesund.

Philipp Albrecht, Elia Blülle, Dennis Bühler, Oliver Fuchs und Cinzia Venafro

**PS:** Haben Sie Fragen und Feedback, schreiben Sie an: covid19@republik.ch.

<hr /></section>

`.trim()}</Markdown>
```

For compatibility reasons we also support the showing the covid logo with just the format repo url:

```react|noSource
<Markdown schema={createEmailSchema()}>{`
\-\-\-
format: 'https://github.com/republik/format-covid-19-uhr-newsletter'
\-\-\-

<section><h6>CENTER</h6>

Liebe Leserinnen, liebe Leser

At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. **Lorem ipsum** dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua ...

Bleiben Sie umsichtig, bleiben Sie freundlich, bleiben Sie gesund.

Philipp Albrecht, Elia Blülle, Dennis Bühler, Oliver Fuchs und Cinzia Venafro

**PS:** Haben Sie Fragen und Feedback, schreiben Sie an: covid19@republik.ch.

<hr /></section>

`.trim()}</Markdown>
```

## Web schema

```code|lang-jsx
import createWebSchema from '@project-r/styleguide/lib/templates/EditorialNewsletter/web'
const webSchema = createSchema()
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

Ladies and Gentlemen

At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est _Lorem ipsum_ dolor sit amet. **Lorem ipsum** dolor _**sit amet**_, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.

*   Sadipscing elitr
*   Lorem ipsum dolor sit amet
*   Diam voluptua

Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.

1.  Sadipscing elitr. **Something bold.**
2.  Lorem ipsum dolor sit amet *italics...*
3.  Diam voluptua

## Ein Zwischentitel

Duis autem vel eum iriure **Something bold.** dolor in *italics...* hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

Das Rothaus _Foto: Laurent Burst_

<hr /></section>

## Ein Chart

Weit hinten, hinter den Wortbergen, fern der Länder Vokalien und Konsonantien leben die Blindtexte. Abgeschieden wohnen sie in Buchstabhausen an der Küste des Semantik, eines grossen Sprachozeans.

<section><h6>FIGURE</h6>

\`\`\`
{"plain": true}
\`\`\`

![](/static/nl-chart.png?size=1318x540)

Neue Spitaleinweisungen; gleitender Mittelwert über 7 Tage. Die Daten nach dem 13. November sind vermutlich noch unvollständig, deshalb haben wir sie nicht berücksichtigt. Stand: 20.11.2020. Quelle: Bundesamt für Gesundheit.

<hr /></section>

Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.

<section><h6>QUOTE</h6>

Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.

Thomas Jefferson

<hr /></section>

<section><h6>BUTTON</h6>

\`\`\`
{"primary": true, "block": true}
\`\`\`

[Call to action](#nox-an-der-langstrasse "Zur Sektion springen")

<hr /></section>

<section><h6>BUTTON</h6>

\`\`\`
{"block": true}
\`\`\`

[No thanks!](/devnull "Ins nichts")

<hr /></section>

Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat.

<hr /></section>

`}</Markdown>
```

### Without cover image

```react|noSource
<Markdown schema={webSchema}>{`

<section><h6>CENTER</h6>

Ladies and Gentlemen

At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. **Lorem ipsum** dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua ...

<hr /></section>

`}</Markdown>
```

## Variables

Custom greetings can be accomplished with variables. Provided via a react context.

```react|noSource
<VariableContext.Provider value={{ firstName: 'Max', lastName: 'Muster' }}>
<Markdown schema={webSchema}>{`

<section><h6>CENTER</h6>

<section><h6>IF</h6>

\`\`\`
{"present": "lastName"}
\`\`\`

Guten Tag <span data-variable="firstName"></span> <span data-variable="lastName"></span>

<section><h6>ELSE</h6>

Hallo, guten Tag

<hr /></section>

<hr /></section>

<hr /></section>

`}</Markdown>
</VariableContext.Provider>
```

The email schema renders them as [Mailchimp merge tags](https://mailchimp.com/en/help/merge-tags/) by default:

```react|noSource
<Markdown schema={createEmailSchema()}>{`

<section><h6>CENTER</h6>

<section><h6>IF</h6>

\`\`\`
{"present": "lastName"}
\`\`\`

Guten Tag <span data-variable="firstName"></span> <span data-variable="lastName"></span>

<section><h6>ELSE</h6>

Hallo, guten Tag

<hr /></section>

<hr /></section>

<hr /></section>

`}</Markdown>
```

A custom context can be provided through the schema creator, e.g. for rendering a transactional email:

```react|noSource
<Markdown schema={createEmailSchema({ variableContext: { firstName: 'Max', lastName: 'Muster' } })}>{`

<section><h6>CENTER</h6>

<section><h6>IF</h6>

\`\`\`
{"present": "lastName"}
\`\`\`

Guten Tag <span data-variable="firstName"></span> <span data-variable="lastName"></span>

<section><h6>ELSE</h6>

Hallo, guten Tag

<hr /></section>

<hr /></section>

<hr /></section>

`}</Markdown>
```
