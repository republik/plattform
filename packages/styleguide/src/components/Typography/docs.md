## Webfonts

We have several font cuts:

- `serifTitle`
- `serifRegular`
- `serifItalic`
- `serifBold`
- `serifBoldItalic`
- `sansSerifRegular`
- `sansSerifItalic`
- `sansSerifMedium`
- `cursiveTitle`

Full font style definitions are available as `fontStyles` export from the style guide. The styles are made available as plain JavaScript objects which can be spread into glamors `css`, or used directly in inline styles. You should never overwrite `font-family`, `font-style` or `font-weight`.

```code|lang-js
import { fontStyles } from '@project-r/styleguide'
```

The old `fontFamilies` export is deprecated and should no longer be used.

A helper function to generate the `@font-face` css is available as `fontFaces`.

### Next.js example

1. Copy the font files to `/static/fonts`
2. Include the following in your `pages/_document.js`:

```code|lang-js
import { fontFaces } from '@project-r/styleguide'

<style dangerouslySetInnerHTML={{ __html: fontFaces() }} />
```

## Font Styles Sizes

Prebuild styles with font sizes with line heights are also available. And should be used in most cases.

```code|lang-js
import { colors: { text }, fontStyles: { serifRegular21 } } from '@project-r/styleguide'

<div {...css({...serifRegular21, color: text})}>…</div>
```

#### `serifTitle{58,38,32,30,26,22,20}`
```react|noSource,plain
<div {...css(styles.serifTitle58)}>The quick brown fox jumps over</div>
```
```react|noSource,plain
<div {...css(styles.serifTitle38)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifTitle32)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifTitle30)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifTitle26)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifTitle22)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifTitle20)}>The quick brown fox jumps over the lazy dog</div>
```

#### `serifBold{52,42,36,28,24,19,17}`
```react|noSource,plain
<div {...css(styles.serifBold52)}>The quick brown fox jumps over</div>
```
```react|noSource,plain
<div {...css(styles.serifBold42)}>The quick brown fox jumps over the lazy dog</div>
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
<div {...css(styles.serifBold19)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifBold17)}>The quick brown fox jumps over the lazy dog</div>
```

#### `serifRegular{25,23,21,19,18,17,16,14}`
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
<div {...css(styles.serifRegular18)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifRegular17)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifRegular16)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.serifRegular14)}>The quick brown fox jumps over the lazy dog</div>
```

#### `sansSerifMedium{58,40,32,26,22,20,19,18,16,15,14}`
```react|noSource,plain
<div {...css(styles.sansSerifMedium58)}>The quick brown fox jumps over</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium40)}>The quick brown fox jumps over</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium32)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium26)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium22)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium20)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium19)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium18)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium16)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifMedium15)}>The quick brown fox jumps over the lazy dog</div>
```

#### `sansSerifRegular{30,23,22,21,18,16,15,14,13,12,11,10}`
```react|noSource,plain
<div {...css(styles.sansSerifRegular30)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifRegular23)}>The quick brown fox jumps over the lazy dog</div>
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
<div {...css(styles.sansSerifRegular13)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifRegular12)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifRegular11)}>The quick brown fox jumps over the lazy dog</div>
```
```react|noSource,plain
<div {...css(styles.sansSerifRegular10)}>The quick brown fox jumps over the lazy dog</div>
```

#### `cursiveTitle{58,30}`
```react|noSource,plain
<div {...css(styles.cursiveTitle58)}>The quick brown fox jumps over</div>
```
```react|noSource,plain
<div {...css(styles.cursiveTitle30)}>The quick brown fox jumps over the lazy dog</div>
```


## Editorial Content

Long, editorial texts use the serif cuts. With margins, except `:first-child` 0 top, `:last-child` 0 bottom.

### Format

```react
<Editorial.Format>Neutrum</Editorial.Format>
```

We use `text-decoration-skip: ink` to avoid `g`-conflicts.

```react
<Editorial.Format>Garage</Editorial.Format>
```

### Headlines

```react
<Editorial.Headline>The quick brown...</Editorial.Headline>
```

### Lead

```react
<Editorial.Lead>
  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
  {' '}
  At vero eos et accusam et justo <em>duo dolores</em>.
</Editorial.Lead>
```

### Credit

```react
<Editorial.Credit>
  An article by <Editorial.A href='#'>Christof Moser</Editorial.A>, 31 December 2017
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
    The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. «What's happened to me?» he thought. It wasn't a dream.
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
    <strong>Franz Kafka:</strong> One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
  </Editorial.Answer>
  <Editorial.Question>
    What happened next?
  </Editorial.Question>
  <Editorial.Answer>
    The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. «What's happened to me?» he thought. It wasn't a dream.
  </Editorial.Answer>
</article>
```


### Link

We use `text-decoration-skip: ink` to avoid `g`-conflicts.

```react
<Editorial.P>
  <Editorial.A href='https://www.republik.ch/~ganster'>Ein Gangster</Editorial.A>
</Editorial.P>
```


### Bold and Cursive

`Editorial.P`, `Editorial.Question` and `Editorial.Lead` support `strong` and `em` child elements. You can also apply `Editorial.fontRule` to arbitrary elements:

```react
<div {...Editorial.fontRule}>
  Ladies and Gentlemen,
  {' '}
  <strong>es ist Zeit.</strong>
  {' '}
  Es ist <em>heiss.</em>
  {' '}
  So en <strong><em>scheiss</em></strong>,
  {' '}
  mit <em><strong>Schweiss</strong></em>.
</div>
```

`Editorial.Emphasis` and `Editorial.Cursive` are deprecated. Use `Editorial.fontRule` instead.

### Note

```react
<Editorial.Note>
   One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
</Editorial.Note>
```

## Meta

Short, meta texts like section and format pages use the sans serif cuts. With font sizes and margins like Editorial.

### Headlines

```react
<Meta.Headline>The quick brown...</Meta.Headline>
```

### Lead

```react
<Meta.Lead>
  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
  {' '}
  At vero eos et accusam et justo <em>duo dolores</em>.
</Meta.Lead>
```

### Paragraphs and Subheads

```react|responsive
<article>
  <Meta.P>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
  </Meta.P>
  <Meta.Subhead>The quick brown fox jumps over the lazy dog</Meta.Subhead>
  <Meta.P>
    The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. «What's happened to me?» he thought. It wasn't a dream.
  </Meta.P>
  <Meta.P>
     His room, a proper human room although a little too small, lay peacefully between its four familiar walls. One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.
  </Meta.P>
</article>
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

`Interaction.Headline` is deprecated. Use `Meta.Headline` instead.

### Paragraphs

```react|responsive
<>
  <Interaction.P>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment.
  </Interaction.P>
</>
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

### Bold and Cursive

`Interaction.P` supports `strong` and `em` child elements:

```react
<Interaction.P>
  Ladies and Gentlemen,
  {' '}
  <strong>es ist Zeit.</strong>
  <br />
  Let's go!
  {' '}
  <em>Clara</em>
</Interaction.P>
```

You can also apply `Interaction.fontRule` to arbitrary elements.

`Interaction.Emphasis` and `Interaction.Cursive` are deprecated. Use `Interaction.fontRule` instead.

## Generic

### Sub and Super-Script

```react
<div>
  <Interaction.P>40 µg/m<Sup>3</Sup></Interaction.P>
  <Editorial.P>CO<Sub>2eq</Sub></Editorial.P>
  <Editorial.P>
    One morning, when Gregor Samsa <em>woke from troubled dreams</em>, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see <strong>40 µg/m<Sup>3</Sup> and CO<Sub>2eq</Sub></strong> and <Editorial.A href='#'>40 µg/m<Sup>3</Sup> and CO<Sub>2eq</Sub></Editorial.A>.
  </Editorial.P>
  <Editorial.P>
    <Sub>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly.</Sub>
  </Editorial.P>
</div>
```

### Horizontal Rule

```react
<div style={{background: '#fff'}}>
  <Interaction.P>Part One</Interaction.P>
  <HR />
  <Editorial.P>Part Two</Editorial.P>
</div>
```

## Legacy Editorial Content Styles

Used for the [crowdfunding](https://github.com/orbiting/crowdfunding-frontend). Might be deprecated and removed soon.

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
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. «What's happened to me?» he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls. A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in a nice, gilded frame. It showed a lady fitted out with a fur hat and fur boa who sat upright, raising a heavy fur muff that covered the whole of her lower arm towards the viewer. Gregor then turned to look out the window at the dull weather.
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

