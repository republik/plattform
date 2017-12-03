Note that ndashes and counts are positioned outside of the text block on desktop, and inside on mobile.

## `<Editorial.UL />`

Props:
- `compact`: Whether the vertical list item margins should be compact.

```react
<Center>
  <Editorial.P>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</Editorial.P>
  <Editorial.UL>
    <Editorial.LI>
      <p>He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</p>
    </Editorial.LI>
    <Editorial.LI>
      <p>The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.</p>
    </Editorial.LI>
    <Editorial.LI>
      <p>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</p>
    </Editorial.LI>
  </Editorial.UL>
  <Editorial.P>If he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</Editorial.P>
  <Editorial.UL compact>
    <Editorial.LI>
      <p>He lay on his armour-like back</p>
    </Editorial.LI>
    <Editorial.LI>
      <p>The bedding seemed ready</p>
    </Editorial.LI>
    <Editorial.LI>
      <p>He found himself transformed</p>
    </Editorial.LI>
  </Editorial.UL>
  <Editorial.P>If he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</Editorial.P>
</Center>
```

## `<Editorial.OL />`

Props:
- `compact`: Whether the vertical list item margins should be compact.

```react
<Center>
  <Editorial.P>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</Editorial.P>
  <Editorial.OL>
    <Editorial.LI>
      <p>He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</p>
    </Editorial.LI>
    <Editorial.LI>
      <p>The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.</p>
    </Editorial.LI>
    <Editorial.LI>
      <p>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</p>
    </Editorial.LI>
  </Editorial.OL>
  <Editorial.P>If he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</Editorial.P>
  <Editorial.OL compact>
    <Editorial.LI>
      <p>He lay on his armour-like back</p>
    </Editorial.LI>
    <Editorial.LI>
      <p>The bedding seemed ready</p>
    </Editorial.LI>
    <Editorial.LI>
      <p>He found himself transformed</p>
    </Editorial.LI>
  </Editorial.OL>
  <Editorial.P>If he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</Editorial.P>
</Center>
```

## Nested lists

Nested lists have a slightly smaller font size. Nesting more than two levels is discouraged.

```react
<Center>
  <Editorial.P>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</Editorial.P>
  <Editorial.OL>
    <Editorial.LI>
      <p>The bedding was hardly able to cover it and seemed ready to slide off any moment.</p>
      <Editorial.UL>
        <Editorial.LI>
          <p>He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</p>
        </Editorial.LI>
        <Editorial.LI>
          <p>The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.</p>
        </Editorial.LI>
        <Editorial.LI>
          <p>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</p>
        </Editorial.LI>
      </Editorial.UL>
    </Editorial.LI>
    <Editorial.LI>
      <p>He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</p>
      <Editorial.UL compact>
        <Editorial.LI>
          <p>Compact</p>
        </Editorial.LI>
        <Editorial.LI>
          <p>Gregor Samsa woke from troubled dreams</p>
        </Editorial.LI>
        <Editorial.LI>
          <p>He found himself transformed</p>
        </Editorial.LI>
      </Editorial.UL>
    </Editorial.LI>
  </Editorial.OL>
  <Editorial.P>If he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</Editorial.P>
  <Editorial.UL>
    <Editorial.LI>
      <p>The bedding was hardly able to cover it and seemed ready to slide off any moment.</p>
      <Editorial.OL>
        <Editorial.LI>
          <p>He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</p>
        </Editorial.LI>
        <Editorial.LI>
          <p>The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.</p>
        </Editorial.LI>
        <Editorial.LI>
          <p>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</p>
        </Editorial.LI>
      </Editorial.OL>
    </Editorial.LI>
    <Editorial.LI>
      <p>He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</p>
      <Editorial.OL compact>
        <Editorial.LI>
          <p>Compact</p>
        </Editorial.LI>
        <Editorial.LI>
          <p>Gregor Samsa woke from troubled dreams</p>
        </Editorial.LI>
        <Editorial.LI>
          <p>He found himself transformed</p>
        </Editorial.LI>
      </Editorial.OL>
    </Editorial.LI>
  </Editorial.UL>
  <Editorial.P>If he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</Editorial.P>
</Center>
```

