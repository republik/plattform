

Supported props:
- `discussions` (array): array of discussions.
- `t` (function): translation function.

Caveat: long words like «Generationenwechsel» in the highlighted comment will be cut off at certain screen sizes unless soft hyphens are added.

```react|span-6
<TeaserActiveDebates
  t={t}
  discussions={activeDebates.discussions}
>
  <TeaserSectionTitle href="/">
    Aktive Debatten
  </TeaserSectionTitle>
</TeaserActiveDebates>
```

```react|span-6
<TeaserActiveDebates
  t={t}
  discussions={activeDebatesWithoutHighlight.discussions}
>
  <TeaserSectionTitle href="/">
    Aktive Debatten
  </TeaserSectionTitle>
</TeaserActiveDebates>
```



## `<ActiveDebateTeaser />`

Supported props:
- `t` (func): translation function.
- `path` (string): the path to the discussion page.
- `documentTitle` (string): The title of the article that triggered the debate.
- `commentCount` (number):  a `number` of the current contributions to the debate, this number will be displayed next to the "comment" icon.
- `comments` (array): An array of objects that mimics an api call:
```code|lang-jsx,span-3
    shapeOf({
      id: string,
      parentIds: array,
      createdAt: Date,
      updatedAt: Date,
      preview: shapeOf({
        string: string,
        more: boolean
      }),
      displayAuthor: shapeOf({
        id: string,
        name: string,
        slug: string,
        credential: string,
        profilePicture: string
      })
    })
```

```react|span-3
<ActiveDebateTeaser
  t={t}
  path={debate.path}
  documentTitle={debate.title}
  commentCount={debate.comments.totalCount}
  comments={debate.comments.nodes}
/>
```


## Internal

These components are used to build `ActiveDebateTeaser`.

### `<ActiveDebateHeader />`

```react|span-3
<ActiveDebateHeader
  t={t}
  documentTitle={'Stell dir vor, die UBS wird klimaneutral'}
  commentCount={45}
  href={''}
/>
```
### `<ActiveDebateComment />`

If the comment has the `highlight` property defined, the body of the comment will be rendered as a quote in a bigger font.

```react|span-3
<ActiveDebateComment
  t={t}
  preview={{
    string:
      'Einmal mehr geht es bei dieser Debatte um eine Huhn Ei Debatte. Ist es Aufgabe der Bank ihren Beitrag zu leisten oder in einer direkten Demokratie wie der Schweiz an den Stimmbürgern, die entsprechenden Rahmenbedingunge zu schaffen. Die',
    more: true
  }}
/>
```

```react|span-3
<ActiveDebateComment
  t={t}
  highlight={'Gut möglich, dass es bis zu einer klimaneutralen Grossbank einen Generationenwechsel braucht.'}
/>
```

###  `Discussion/Comment/Header`

This component is borrowed from the [Discussion section](/components/discussion/internal). It is used to display meta information about the last comment(s) in an `ActiveDebateTeaser`.

```react|span-2
<Header
  t={t}
  comment={oneComment}
  isExpanded={true}
/>
```
