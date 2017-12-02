Note that dashes and counts are positioned outside of the text block on desktop, and inside on mobile.

## `<UL />`

Props:
- `compact`: Whether the vertical list item margins should be compact.

```react
<Center>
  <Editorial.P>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</Editorial.P>
  <UL>
    <li>
      He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
    </li>
    <li>
      The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.
    </li>
    <li>
      One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.
    </li>
  </UL>
  <Editorial.P>If he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</Editorial.P>
  <UL compact>
    <li>
      He lay on his armour-like back
    </li>
    <li>
      The bedding seemed ready
    </li>
    <li>
      He found himself transformed
    </li>
  </UL>
  <Editorial.P>If he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</Editorial.P>
</Center>
```

## `<OL />`

Props:
- `compact`: Whether the vertical list item margins should be compact.

```react
<Center>
  <Editorial.P>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</Editorial.P>
  <OL>
    <li>
      He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
    </li>
    <li>
      The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.
    </li>
    <li>
      One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.
    </li>
  </OL>
  <Editorial.P>If he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</Editorial.P>
  <OL compact>
    <li>
      He lay on his armour-like back
    </li>
    <li>
      The bedding seemed ready
    </li>
    <li>
      He found himself transformed
    </li>
  </OL>
  <Editorial.P>If he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</Editorial.P>
</Center>
```

## Nested lists

Nested lists have a slightly smaller font size. Nesting more than two levels is discouraged.

```react
<Center>
<Editorial.P>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</Editorial.P>
<OL>
  <li>
    The bedding was hardly able to cover it and seemed ready to slide off any moment.
    <UL>
      <li>
        He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
      </li>
      <li>
        The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.
      </li>
      <li>
        One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.
      </li>
    </UL>
  </li>
  <li>
    He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
    <UL compact>
      <li>
        Compact
      </li>
      <li>
        Gregor Samsa woke from troubled dreams
      </li>
      <li>
        He found himself transformed
      </li>
    </UL>
  </li>
</OL>
<Editorial.P>If he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</Editorial.P>
<UL>
  <li>
    The bedding was hardly able to cover it and seemed ready to slide off any moment.
    <OL>
      <li>
        He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
      </li>
      <li>
        The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.
      </li>
      <li>
        One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.
      </li>
    </OL>
  </li>
  <li>
    He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
    <OL compact>
      <li>
        Compact
      </li>
      <li>
        Gregor Samsa woke from troubled dreams
      </li>
      <li>
        He found himself transformed
      </li>
    </OL>
  </li>
</UL>
<Editorial.P>If he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</Editorial.P>
</Center>
```

