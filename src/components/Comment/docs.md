### `<Comment />`

A `<Comment />` is a combination of `<CommentHeader />` and the comment content. The actions are not part of this component.

```react|noSource,span-4
<Comment
  t={t}
  createdAt={isoString}
  timeago={isoString => 'gerade eben'}
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Journalist', verified: true}
  }}
  content="Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. "
/>
```

```react|noSource,span-2
<Comment
  t={t}
  createdAt={isoString}
  timeago={isoString => 'gerade eben'}
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Bundesrat', verified: false}
  }}
  content="Er versuchte, sich in der Dunkelheit seinen Weg zu ertasten und erstarrte: Anscheinend gab es keinen anderen Ausweg aus diesem kleinen Hof als den Durchgang, durch den er gekommen war."
/>
```

#### Unpublished Comments

```react|span-2
<Comment
  t={t}
  createdAt={isoString}
  timeago={isoString => 'gerade eben'}
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Bundesrat', verified: false}
  }}
  published={false}
  content={null}
/>
```

```react|span-2
<Comment
  t={t}
  createdAt={isoString}
  timeago={isoString => 'gerade eben'}
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Bundesrat', verified: false}
  }}
  published={false}
  userCanEdit
  content={"Ich bin dumm."}
/>
```

```react|span-2
<Comment
  t={t}
  createdAt={isoString}
  timeago={isoString => 'gerade eben'}
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Bundesrat', verified: false}
  }}
  published={false}
  userCanEdit
  adminUnpublished
  content={"Du Arsch!"}
/>
```

#### Updated Comments

```react|span-3
<Comment
  t={t}
  createdAt={(new Date((new Date()).setMinutes(-13))).toISOString()}
  updatedAt={isoString}
  timeago={isoString =>
    'vor ' + Math.round((Date.now() - Date.parse(isoString)) / 1000 / 60) + 'm'}
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Bundesrat', verified: false}
  }}
/>
```

```react|span-3
<Comment
  t={t}
  createdAt={(new Date((new Date()).setMinutes(-13))).toISOString()}
  updatedAt={isoString}
  timeago={isoString =>
    'vor ' + Math.round((Date.now() - Date.parse(isoString)) / 1000 / 60) + 'm'}
  displayAuthor={{
    name: 'Agent Seymour Rutherford Simmons',
    credential: {description: 'Member of Sector 7 Advanced Research Division', verified: true}
  }}
/>
```

#### Newlines

Intersperses `<br />`s for up to two new lines between text. Leading and tailing new lines are completely ignored.

```react|span-3
<Comment
  t={t}
  content={`
    Hallo

    Zeil 1
    Zeile 2

    PS`}
  createdAt={(new Date((new Date()).setMinutes(-13))).toISOString()}
  updatedAt={isoString}
  timeago={isoString =>
    'vor ' + Math.round((Date.now() - Date.parse(isoString)) / 1000 / 60) + 'm'}
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser'
  }}
/>
```

```react|span-3
<Comment
  t={t}
  content={`


    Hallo






    ?


    `}
  createdAt={(new Date((new Date()).setMinutes(-13))).toISOString()}
  updatedAt={isoString}
  timeago={isoString =>
    'vor ' + Math.round((Date.now() - Date.parse(isoString)) / 1000 / 60) + 'm'}
  displayAuthor={{
    name: 'Agent Seymour Rutherford Simmons'
  }}
/>
```


### `<CommentHeader />`

The profile picture in the `<CommentHeader />` has a white border so that we can place a vertical line underneath when this component is used in a `CommentTree`.

```react|noSource,span-2
<CommentHeader
  createdAt={isoString}
  timeago={isoString => 'gerade eben'}
  name='Anonym'
/>
```

```react|noSource,span-2
<CommentHeader
  createdAt={isoString}
  timeago={isoString => 'gerade eben'}
  name='Anonym'
  credential={{description: 'Journalist', verified: true}}
/>
```

```react|noSource,span-2
<CommentHeader
  createdAt={isoString}
  timeago={isoString => 'gerade eben'}
  profilePicture='/static/profilePicture1.png'
  name='Christof Moser'
/>
```

```react|noSource,span-2
<CommentHeader
  createdAt={isoString}
  timeago={isoString => 'gerade eben'}
  profilePicture='/static/profilePicture1.png'
  name='Christof Moser'
  credential={{description: 'Journalist', verified: true}}
/>
```

```react|noSource,span-2
<CommentHeader
  createdAt={isoString}
  timeago={isoString => 'gerade eben'}
  profilePicture='/static/profilePicture1.png'
  name='Christof Moser'
  credential={{description: 'Bundesrat', verified: false}}
/>
```

```react|noSource,span-2
<CommentHeader
  createdAt={isoString}
  timeago={isoString => 'gerade eben'}
  name='Agent Seymour Rutherford Simmons'
  credential={{description: 'Member of Sector 7 Advanced Research Division', verified: true}}
/>
```

### `<CommentActions />`

```react|noSource,span-2
<CommentActions
  t={t}

  score={8}

  onAnswer={undefined}
  onUpvote={undefined}
  onDownvote={undefined}
/>
```
```react|noSource,span-2
<CommentActions
  t={t}

  score={8}

  onAnswer={() => {}}
  onUpvote={undefined}
  onDownvote={() => {}}
/>
```
```react|noSource,span-2
<CommentActions
  t={t}

  score={8}

  onAnswer={() => {}}
  onUpvote={() => {}}
  onDownvote={() => {}}
/>
```
