A teaser of a comment.

Props:
- `id`: The comment id.
- `displayAuthor`: The comment's displayAuthor object. If not present, `timeago` will be rendered in the footer.
- `preview`: The comment's preview object with a `string` (i.e. a short snippet of the comment) and a `more` boolean.
- `highlights`: An optional array containing highlighted strings for search results. If present, it will trump `preview`.
- `discussion`: The comment's discussion object. Used to extract title and link properties.
- `tags`: An optional array of tags. Currently only the first tag is used, but that might change in the future.
- `parentIds`: The comment's array of parent ids. Used to determine whether it's a comment or a reply.
- `createdAt`: The comment's creation timestamp.
- `timeago`: A function that renders a human-readable version of `createdAt`.
- `newPage`: Whether to display a "new page" icon.
- `Link`: A Next.js like `<Link />` component, receiving these props:
  - `commentId`: string
  - `displayAuthor`: object
  - `passHref`: Boolean, indicates this will eventually end in an `a` tag and you may overwrite `href`
  - `discussion`:
    ```code|lang-jsx
    shapeOf({
      id: string,
      document: shapeOf({
        id: string,
        meta: shapeOf({
          template: string,
          ownDiscussion: shapeOf({
            id: string,
            closed: boolean
          })
        })
      })
    })
```

```react|noSource,span-3
<CommentTeaser
  id="X"
  createdAt="2019-01-01"
  preview={{
    string: "Die Zeitungskäufe von Christoph Blocher, die Selbstideologisierung der NZZ, die Frankenstein-Monster-Strategie der Tamedia: Ehrlich gesagt wäre es uns lieber",
    more: true
  }}
  timeago={isoString => 'gerade eben'}
  discussion={{
    title: "Der Crowdfunding-Code"
  }}
  newPage={true}
  t={t}
/>
```

```react|noSource,span-3
<CommentTeaser
  id="X"
  tags={["Kritik"]}
  createdAt="2019-01-01"
  preview={{
    string: "Die Zeitungskäufe von Christoph Blocher, die Selbstideologisierung der NZZ, die Frankenstein-Monster-Strategie der Tamedia: Ehrlich gesagt wäre es uns lieber",
    more: true
  }}
  timeago={isoString => 'gerade eben'}
  discussion={{
    title: "Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie"
  }}
  t={t}
/>
```

```react|noSource,span-3
<CommentTeaser
  id="X"
  createdAt="2019-01-01"
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Journalist'}
  }}
  preview={{
    string: "Die Zeitungskäufe von Christoph Blocher, die Selbstideologisierung der NZZ, die Frankenstein-Monster-Strategie der Tamedia: Ehrlich gesagt wäre es uns lieber",
    more: true
  }}
  timeago={isoString => 'gerade eben'}
  discussion={{
    title: "Der Crowdfunding"
  }}
  newPage={true}
  t={t}
/>
```

```react|noSource,span-3
<CommentTeaser
  id="X"
  createdAt="2019-01-01"
  tags={["Kritik"]}
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Journalist'}
  }}
  preview={{
    string: "Die Zeitungskäufe von Christoph Blocher, die Selbstideologisierung der NZZ, die Frankenstein-Monster-Strategie der Tamedia: Ehrlich gesagt wäre es uns lieber",
    more: true
  }}
  timeago={isoString => 'gerade eben'}
  discussion={{
    title: "Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie"
  }}
  t={t}
/>
```

```react|noSource,span-3
<CommentTeaser
  id="X"
  createdAt="2019-01-01"
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Journalist', verified: true}
  }}
  highlights={[
    {fragments: [
        "Die Zeitungskäufe von Christoph Blocher, die Selbstideologisierung der NZZ, die <em>Frankenstein</em>-Monster-Strategie der Tamedia"
      ]
    }
  ]}
  parentIds={["somecommentid"]}
  timeago={isoString => 'gerade eben'}
  discussion={{
    title: "Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie"
  }}
  t={t}
/>
```

```react|noSource,span-3
<CommentTeaser
  id="X"
  createdAt="2019-01-01"
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Journalist', verified: true}
  }}
  preview={{
    string: "FrankensteinSuperLangesMonsterWortOverflowVerhinderungsStrategieFrankensteinSuperLangesMonsterWortOverflowVerhinderungsStrategie ist word-wrap: break-word."
  }}
  parentIds={["somecommentid"]}
  timeago={isoString => 'gerade eben'}
  discussion={{
    title: "Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie"
  }}
  t={t}
/>
```
