```react
  <>
      <Editorial.P> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Okay, so let's be a bit extra and add a <ExpandableLink description="This is a link description. It has a maximum size of XXX characters." href="https://www.republik.ch/2022/07/06/so-long-covid?query=noch-viel-länger-um-zu-testen" t={t}>Link here, that could be quite long, because we are Republik after all</ExpandableLink>, for styling purposes. For contrast, this is an <Editorial.A>Editorial Link</Editorial.A>.</Editorial.P>

      <Editorial.P> Lorem ipsum I don't know where I am. So let's be a bit extra and add a <ExpandableLink description="This is a link description. It has a maximum size of XXX characters. What if it's a bit long, how will size change." href="https://www.republik.ch/2022/07/06/so-long-covid" t={t}>Link here, a short one</ExpandableLink>, for styling purposes. For contrast, this is an <Editorial.A>Editorial Link</Editorial.A>.</Editorial.P>

      <Editorial.P>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Editorial.P>
  </>
```

## Formatting

The following description text:

```
<b>Brand</b> <em>new</em> data on CO<sub>2</sub> levels
```

Renders as follow:

```react
<Editorial.P><ExpandableLink description="<b>Brand</b> <em>new</em> data on CO<sub>2</sub> levels" href="https://www.republik.ch" t={t}>Link</ExpandableLink> with html formatting.</Editorial.P>
```

Supported html tags for formatting:

- b tags for *<b>bold</b>*
- em tags for **<em>italics</em>**
- sub and sup tags for subscript and superscript