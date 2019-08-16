## `<TeaserSectionTitle />`.

A section title. If `href` is defined, an icon with a chevron right will be displayed on the right of the section title.

Supported props:
- `onClick` (function): function triggered on click.
- `href` (string): link.
- `children`: children component (section title)

```react|span-3
<TeaserSectionTitle
  onClick={() => {}}
>
    Alle Serien
</TeaserSectionTitle>
```

```react|span-3
<TeaserSectionTitle
  href='/'
  onClick={() => {}}
>
    Aktive Debatten
</TeaserSectionTitle>
```