## Webfonts

We have four font cuts:

- `serifRegular`
- `serifBold`
- `sansSerifRegular`
- `sansSerifMedium`

Full font family definitions are available as `fontFamilies` export from the style guide.

```code|lang-js
import {fontFamilies} from '@project-r/styleguide'
```

```react|no-source
<pre style={{overflow: 'auto'}}>
    <code>
    {JSON.stringify(fontFamilies, null, 2)}
    </code>
</pre>
```

A helper function to generate the `@font-face` css is available as `fontFaces`.

### Next.js example

1. Copy the font files to `/static/fonts`
2. Include the following in your `pages/_document.js`:

```code|lang-js
import {fontFaces} from '@project-r/styleguide'

<style dangerouslySetInnerHTML={{ __html: fontFaces() }} />
```

## Font styles

A font style combines a font cut with a font size, line height, letter spacing, text transform etc. The styles are made available as plain JavaScript objects which can be mixed into glamor css objects, or used directly in inline styles.

Font styles don't include colors, margins, nor do they make use of media queries.

```code|lang-js
import {colors: {text}, fontStyles: {serifRegular21}} from '@project-r/styleguide'

<div {...css({...serifRegular21, color: text})}>…</div>
```

#### `serifTitle{58,30}`
```react|noSource,plain
<div {...css(styles.serifTitle58)}>The quick brown fox jumps over</div>
```
```react|noSource,plain
<div {...css(styles.serifTitle30)}>The quick brown fox jumps over the lazy dog</div>
```

#### `serifBold{52,36,28,24,23,19,16}`
```react|noSource,plain
<div {...css(styles.serifBold52)}>The quick brown fox jumps over</div>
```
```react|noSource,plain
<div {...css(styles.serifBold36)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifBold28)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifBold24)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifBold23)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifBold19)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifBold16)}>The quick brown fox jumps over the lazy dog</div>
```

#### `serifRegular{25,23,21,19,16,14}`
```react|noSource,plain
<div {...css(styles.serifRegular25)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifRegular23)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifRegular21)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifRegular19)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifRegular16)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifRegular14)}>The quick brown fox jumps over the lazy dog</div>
```

#### `sansSerifMedium{58,40,22,20,18p5,16,15p5}`
```react|noSource,plain
<div {...css(styles.sansSerifMedium58)}>The quick brown fox jumps over</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium40)}>The quick brown fox jumps over</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium22)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium20)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium18p5)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium16)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium15p5)}>The quick brown fox jumps over the lazy dog</div>
```

#### `sansSerifRegular{30,21,18,16,15,14,12,11}`
```react|noSource,plain
<div {...css(styles.sansSerifRegular30)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifRegular21)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifRegular18)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifRegular16)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifRegular15)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifRegular14)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifRegular12)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifRegular11)}>The quick brown fox jumps over the lazy dog</div>
```

## Editorial Content

Long, editorial texts use the serif cuts. With margins, except `:first-child` 0 top, `:last-child` 0 bottom.

### Mark

```react
<Editorial.Mark>Neutrum</Editorial.Mark>
  
```

### Headlines

```react
<Editorial.Headline>The quick brown fox</Editorial.Headline>
```

```react
<Editorial.Headline type={'meta'}>The quick brown fox</Editorial.Headline>
```

### Lead

```react
<Editorial.Lead>
  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.
</Editorial.Lead>
```

### Credit

```react
<Editorial.Credit>
  An article by <Editorial.AuthorLink href='#'>Christof Moser</Editorial.AuthorLink>, 31 December 2017
</Editorial.Credit>
```

### Paragraphs and Subheads

```react|responsive
<article>
  <Editorial.P>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
  </Editorial.P>
  <Editorial.Subhead>The quick brown fox jumps over the lazy dog</Editorial.Subhead>
  <Editorial.P>
    The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream.
  </Editorial.P>
  <Editorial.P>
     His room, a proper human room although a little too small, lay peacefully between its four familiar walls. One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.
  </Editorial.P>
</article>
```

### Paragraphs and Questions

```react|responsive
<article>
  <Editorial.Question>
    What happened to Mr. Samsa?
  </Editorial.Question>
  <Editorial.Answer>
    <Editorial.AnswerBy>Franz Kafka</Editorial.AnswerBy> One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
  </Editorial.Answer>
  <Editorial.Question>
    What happened next?
  </Editorial.Question>
  <Editorial.Answer>
    The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream.
  </Editorial.Answer>
</article>
```

### QuoteText and Cite

These are used by the [PullQuote](/pullquote) component.

```react
<blockquote>
  <Editorial.QuoteText>
    Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
  </Editorial.QuoteText>
  <Editorial.Cite>
  Thomas Jefferson
  </Editorial.Cite>
</blockquote>
```

### BoxTitle and BoxText

These are used by the [InfoBox](/infobox) component.

```react
<div>
  <Editorial.BoxTitle>
    This is a box title
  </Editorial.BoxTitle>
  <Editorial.BoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment.
  </Editorial.BoxText>
</div>
```

### Caption and Byline

These are used by the [Figure](/figure) component.

```react
<figure>
  <img src='/static/profilePicture1.png' alt='' />
  <Editorial.Caption>
    Lorem ipsum dolor sit amet consetetur.{' '}
    <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
  </Editorial.Caption>
</figure>
```

## Editorial Content (Crowdfunding)

Long, editorial texts use the serif cuts. With margins, except `:first-child` 0 top, `:last-child` 0 bottom.

### Headlines

```react
<H1>The quick brown...</H1>
```

```react
<H2>The quick brown fox jumps over the lazy dog</H2>
```

### Leads

```react
<Lead>
  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.
</Lead>
```

### Paragraphs

```react|responsive
<div>
  <P>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls. A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in a nice, gilded frame. It showed a lady fitted out with a fur hat and fur boa who sat upright, raising a heavy fur muff that covered the whole of her lower arm towards the viewer. Gregor then turned to look out the window at the dull weather.
  </P>
</div>
```

### Quotes

```react
<Quote source='Thomas Jefferson'>
  Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
</Quote>
```

### Links

```react
<P>
  Code, den wir schon veröffentlicht haben, findest du hier:
  {' '}<A href='https://github.com/orbiting'>github.com/orbiting</A>
</P>
```

## Interaction Text

UI elements and structured information uses the sans serif cuts. Without margins.

### Headlines

```react
<Interaction.H1>The quick brown...</Interaction.H1>
```

```react
<Interaction.H2>The quick brown fox jumps over...</Interaction.H2>
```

```react
<Interaction.H3>The quick brown fox jumps over the lazy dog</Interaction.H3>
```

### Paragraphs

```react|responsive
<div>
    <Interaction.P>
      One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls. A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in a nice, gilded frame. It showed a lady fitted out with a fur hat and fur boa who sat upright, raising a heavy fur muff that covered the whole of her lower arm towards the viewer. Gregor then turned to look out the window at the dull weather.
    </Interaction.P>
</div>
```

### Labels

```react
<Label>
  Zeit verbleibend
</Label>
```

### Links

```react
<Interaction.P>
  Code, den wir schon veröffentlicht haben, findest du hier:
  {' '}<A href='https://github.com/orbiting'>github.com/orbiting</A>
</Interaction.P>
```

