### `<Comment />`

A `<Comment />` is a combination of `<CommentHeader />`, an optional `<CommentContext />` and the comment content. The actions are not part of this component.

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
  content={exampleMdast}
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
  content={exampleMdast}
/>
```

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
  content={exampleMdast}
  context={{
    title: '«Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie»',
    description: <span>Ein Artikel von <Editorial.A href="/foo">Christof Moser</Editorial.A></span>
  }}
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
  content={exampleMdast}
  context={{
    title: '«Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie»',
    description: <span>Ein Artikel von <Editorial.A href="/foo">Christof Moser</Editorial.A></span>
  }}
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
  content={exampleMdast}
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
  content={exampleMdast}
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
  content={exampleMdast}
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
  content={exampleMdast}
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

### `<CommentContext />`

```react|noSource,span-2
<CommentContext
  title={'Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie'}
/>
```

```react|noSource,span-2
<CommentContext
  title={'Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie'}
  description={'Ein Artikel von Christof Moser'}
/>
```

```react|noSource,span-2
<CommentContext
  title={'Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie'}
  description={
    <span>
      Ein Artikel von <Editorial.A href="/foo">Christof Moser</Editorial.A>
    </span>
  }
/>
```

### `<CommentActions />`

```react|noSource,span-2
<CommentActions
  t={t}

  upVotes={8}
  downVotes={3}

  onAnswer={undefined}
  onUpvote={undefined}
  onDownvote={undefined}
/>
```
```react|noSource,span-2
<CommentActions
  t={t}

  upVotes={8}
  downVotes={3}

  onAnswer={() => {}}
  onUpvote={undefined}
  onDownvote={() => {}}
/>
```
```react|noSource,span-2
<CommentActions
  t={t}

  upVotes={8}
  downVotes={3}

  onAnswer={() => {}}
  onUpvote={() => {}}
  onDownvote={() => {}}
/>
```
```react|noSource,span-2
<CommentActions
  t={t}

  upVotes={8}
  downVotes={3}

  onAnswer={() => {}}
  onShare={() => {}}
  onUpvote={() => {}}
  onDownvote={() => {}}
  collapsed={true}
/>
```
```react|noSource,span-2
<CommentActions
  t={t}

  upVotes={8}
  downVotes={3}

  onAnswer={() => {}}
  onShare={() => {}}
  onUpvote={() => {}}
  onDownvote={() => {}}
  collapsed={false}
/>
```
