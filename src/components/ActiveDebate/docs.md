### `<ActiveDebates />`.

Supported props:
- `hasHighlight`: boolean, if `true`, the left column will be reserved for the highlighted debate.
- `discussions`: array of discussions.
- `t`: translation function.

#### With Highlight

```react|span-6
<ActiveDebates
  t={t}
  hasHighlight={activeDebates.hasHighlight}
  discussions={activeDebates.discussions}
/>
```
#### Without Highlight
```react|span-6
<ActiveDebates
  t={t}
  hasHighlight={activeDebatesWithoutHighlight.hasHighlight}
  discussions={activeDebatesWithoutHighlight.discussions}
/>
```

### `<ActiveDebateTeaser />`
A teaser for the active debates.

Supported props:
- `href`: url to the debate page.
- `highlight`: A quote (`string`) that will be displayed with a special style in lieu of `preview.string`.
- `documentTitle`: the title (`string`) of the article that triggered the debate.
- `preview`: an object with the properties:
  - `string`: a `string` that will be display a preview of the last comment.
  - `more`: a `boolean` value.
- `commentCount`: a `number` of the current contributions to the debate, this number will be displayed next to the "comment" icon.
- `displayAuthor`: an object with the properties:
  - `id`: id (`string`) of the last comment's author.
  - `name`: name (`string`) of the last comment's author.
  - `profilePicture`: url to the profile image of the last comment's author.





#### `<ActiveDebateTeaser />`

```react|span-3
<ActiveDebateTeaser
  t={t}
  path={debate.path}
  documentId={debate.id}
  documentTitle={debate.title}
  commentCount={debate.comments.totalCount}
  comments={debate.comments.nodes}
/>
```

#### `<ActiveDebateHeader />`

```react|span-3
<ActiveDebateHeader
  t={t}
  documentTitle={'Stell dir vor, die UBS wird klimaneutral'}
  commentCount={45}
  href={''}
/>
```
#### `<ActiveDebateComment />`

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
