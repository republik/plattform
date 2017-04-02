## Containers

Container definieren die maximale Breite des Grids und kümmeren sich um das horizontale Padding zum Rand.

```react
<Container style={{backgroundColor: 'red'}}>
  <div style={{backgroundColor: 'darkgreen', height: 20}} />
</Container>
```

## Grid & Spans

Je nach verfügbarer Fläche nutzen wir ein zwei oder 18 Spalten Grid.

### Props

- `s` Spaltenbreite für kleine Displays. Brüche von 2, z.B. `1/2`
- `m` Spaltenbreite ab mittel grossem Display. Brüche von 18, z.B. `5/18`

```hint
`<Span>`s müssen in einem `<Grid>` sein
```

```react
<Grid>
  <Span s='1/2' m='6/18'>Foo</Span>
  <Span s='1/2' m='12/18'>Bar</Span>
</Grid>
```

### Offset

```react
<Grid>
  <Span m='1/18' />
  <Span m='10/18'>
    Er hörte leise Schritte hinter sich. Das bedeutete nichts Gutes. Wer würde ihm schon folgen, spät in der Nacht und dazu noch in dieser engen Gasse mitten im übel beleumundeten Hafenviertel? Gerade jetzt, wo er das Ding seines Lebens gedreht hatte und mit der Beute verschwinden wollte! Hatte einer seiner zahllosen Kollegen dieselbe Idee gehabt, ihn beobachtet und abgewartet, um ihn nun um die Früchte seiner Arbeit zu erleichtern?
  </Span>
</Grid>
```

### Pull Right

```react
<Grid>
  <Span s='2/2' m='5/18' style={{float: 'right'}}>
    Ein rechter Sidebar,<br />
    der zuerst kommt auf Mobile.
  </Span>
  <Span s='2/2' m='1/18' />
  <Span s='2/2' m='10/18'>
    Er hörte leise Schritte hinter sich. Das bedeutete nichts Gutes. Wer würde ihm schon folgen, spät in der Nacht und dazu noch in dieser engen Gasse mitten im übel beleumundeten Hafenviertel? Gerade jetzt, wo er das Ding seines Lebens gedreht hatte und mit der Beute verschwinden wollte! Hatte einer seiner zahllosen Kollegen dieselbe Idee gehabt, ihn beobachtet und abgewartet, um ihn nun um die Früchte seiner Arbeit zu erleichtern?
  </Span>
</Grid>
```
