## Web schema

```code|lang-jsx
import createCommentSchema from '@project-r/styleguide/lib/templates/Comment/web'

const schema = createCommentSchema()
```


```react|noSource
<CommentBody>

<Markdown schema={schema}>{`

A comment with [a link](https://example.com/ "Mit Titel"), an autolinked URL https://www.republik.ch and ![an image](/static/landscape.jpg?size=2000x1411 "Mit Bildtitel").

Emphasis (italic) with *asterisks* or _underscores_.

Strong emphasis (bold) with **asterisks** or __underscores__.

Strikethrough uses two tildes. ~~Scratch this.~~

1. First **ordered list** item
2. Another item
1. Actual numbers don't matter, just that it's a number
4. And another item.

* First **unordered list** item
* Another item
* And another item

***

A thematic break above.

All headings are mapped to bold:

# Heading 1

## Heading 2

### Heading 3

Someone said:

> This is a **blockquote**.
> This line is part of the *same quote*.

Inline \`code\` uses \`back-ticks\`.

<h1>Block-level HTML tags aren't supported.</h1>

Inline HTML tags like <sub>subscript</sub> and <sup>superscript</sup> are not supported.

`}</Markdown>

</CommentBody>
```


## Email schema

```code|lang-jsx
import createCommentSchema from '@project-r/styleguide/lib/templates/Comment/email'

const schema = createCommentSchema()
```


```react|noSource
<CommentBody>

<Markdown schema={schema}>{`

A comment with [a link](https://example.com/ "Mit Titel"), an autolinked URL https://www.republik.ch and ![an image](/static/landscape.jpg?size=2000x1411 "Mit Bildtitel").

Emphasis (italic) with *asterisks* or _underscores_.

Strong emphasis (bold) with **asterisks** or __underscores__.

Strikethrough uses two tildes. ~~Scratch this.~~

1. First **ordered list** item
2. Another item
1. Actual numbers don't matter, just that it's a number
4. And another item.

* First **unordered list** item
* Another item
* And another item

***

A thematic break above.

All headings are mapped to bold:

# Heading 1

## Heading 2

### Heading 3

Someone said:

> This is a **blockquote**.
> This line is part of the *same quote*.

Inline \`code\` uses \`back-ticks\`.

<h1>Block-level HTML tags aren't supported.</h1>

Inline HTML tags like <sub>subscript</sub> and <sup>superscript</sup> are not supported.

`}</Markdown>

</CommentBody>
```
