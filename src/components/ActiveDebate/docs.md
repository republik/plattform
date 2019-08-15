```remove-react-source

```

## `<ActiveDebates />`.

Supported props:
- `hasHighlight` (boolean): boolean, if `true`, the left column will be reserved for the highlighted debate, on desktop.
- `discussions` (array): array of discussions.
- `t` (function): translation function.


Careful, long words like "Generationswechsel" in the highlighted section will overflow at certain screen sizes.

#### With Highlight

```react|noSource,span-6
<ActiveDebates
  t={t}
  hasHighlight={activeDebates.hasHighlight}
  discussions={activeDebates.discussions}
/>
```
#### Without Highlight
```react|noSource,span-6
<ActiveDebates
  t={t}
  hasHighlight={activeDebatesWithoutHighlight.hasHighlight}
  discussions={activeDebatesWithoutHighlight.discussions}
/>
```



## `<ActiveDebateTeaser />`
Each active debate is rendered as a teaser.

Supported props:
- `t` (func): translation function.
- `path` (string): the path to the discussion page.
- `documentTitle` (string): The title of the article that triggered the debate.
- `commentCount` (number):  a `number` of the current contributions to the debate, this number will be displayed next to the "comment" icon.
- `comments` (array):


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

```react|noSource,span-2
<Header
  t={t}
  comment={oneComment}
  isExpanded={true}
/>
```
