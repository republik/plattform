## Webfonts

We have four font cuts:

- `serifRegular` Rubis Regular
- `serifBold` Rubis Bold
- `sansSerifRegular` GT America Standard Regular
- `sansSerifMedium` GT America Standard Medium

Full font family definitions are available as `fontFamilies` export from the styleguide.

```react|no-source
<pre style={{overflow: 'auto'}}>
    <code>
    {JSON.stringify(fontFamilies, null, 2)}
    </code>
</pre>
```

The webfonts are licensed for our usage. You are responsible to include the webfonts in your app and track them with our Piwik.

You can obtain the files, including a css file with `@font-face` definitions, from our internal filling system under `00 Vorlagen und Design Grundlagen/Webfonts`.

A helper to generate the `@font-face` css is available and takes an optional `baseUrl` (defaults to `/static/fonts`) argument. 

### Next.js example

1. Copy the font files to `/static/fonts`
2. Include the following in your `pages/_document.js`:

```
import {fontFaces} from '@project-r/styleguide'

<style dangerouslySetInnerHTML={{ __html: fontFaces() }} />
```

## Überschriften

```react
<H1>The quick brown...</H1>
```

```react
<H2>The quick brown fox jumps over the lazy dog</H2>
```

## Leads

```react
<Lead>
  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.
</Lead>
```

## Paragraphen

```react|responsive
<div>
    <P>
      One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls. A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in a nice, gilded frame. It showed a lady fitted out with a fur hat and fur boa who sat upright, raising a heavy fur muff that covered the whole of her lower arm towards the viewer. Gregor then turned to look out the window at the dull weather.
    </P>
</div>
```

## Zitate

```react
<Quote source='Thomas Jefferson'>
  Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.
</Quote>
```

## Labels

```react
<Label>
  Zeit verbleibend
</Label>
```

## Links

```react
<P>
  Code, den wir schon veröffentlicht haben, findest du hier:
  {' '}<A href='https://github.com/orbiting'>github.com/orbiting</A>
</P>
```
