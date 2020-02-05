```remove-react-source

```

Components on this page are not exported from the styleguide. This documentation page exists so we have an overview how the Discussion components are structured internally. It also gives developers a nicer way to visually inspect the individual components if they need to change them.

# Comment

#### Link Preview

Visualisation of the link preview attached to the comment.

```react|noSource,span-3
<Comment.Embed
  comment={comments.comment7}
/>
```

```react|noSource,span-3
<Comment.Embed
  comment={comments.comment8}
/>
```

With top story pick:

```react|noSource,span-3
<Comment.Embed
  comment={comments.comment9}
/>
```

#### Header

```react|noSource,span-2
<Comment.Header
  t={t}
  comment={{
    ...comments.comment1,
    displayAuthor: { name: 'Anonym' }
  }}
/>
```

```react|noSource,span-2
<Comment.Header
  t={t}
  comment={{
    ...comments.comment1,
    displayAuthor: {
      profilePicture: '/static/profilePicture1.png',
      name: 'Christoph Moser',
      credential: { description: 'Journalist' }
    }
  }}
/>
```

```react|noSource,span-2
<Comment.Header
  t={t}
  comment={{
    ...comments.comment1,
    createdAt: "2000-01-01",
    updatedAt: new Date().toISOString(),
    displayAuthor: {
      name: 'Queen Daenerys Stormborn of the House Targaryen',
      credential: { description: 'The rightful Queen of the Seven Kingdoms', verified: true }
    }
  }}
/>
```

```react|noSource,span-3
<Comment.Header
  t={t}
  comment={{
    ...comments.comment1,
    displayAuthor: {
      profilePicture: '/static/profilePicture1.png',
      name: 'Christoph Moser',
      credential: { description: 'Journalist', verified: true }
    },
    comments: {
      ...comments.comment1.comments,
      totalCount: 1
    }
  }}
  onToggle={() => {}}
/>
```

```react|noSource,span-3
<Comment.Header
  t={t}
  comment={{
    ...comments.comment1,
    createdAt: "2000-01-01",
    updatedAt: new Date().toISOString(),
    displayAuthor: {
      name: 'Queen Daenerys Stormborn of the House Targaryen',
      credential: { description: 'The rightful Queen of the Seven Kingdoms', verified: true }
    }
  }}
  onToggle={() => {}}
/>
```

If the comment is below a certain depth, we hide the profile picture and instead show the indent with vertical lines.

```react|noSource,span-2
<Comment.Header
  t={t}
  comment={{
    ...comments.comment6,
    displayAuthor: {
      name: 'Queen Daenerys Stormborn of the House Targaryen',
      credential: { description: 'The rightful Queen of the Seven Kingdoms', verified: true }
    }
  }}
/>
```

#### Body

The **Body** component (shown on the left) includes the optional **Context** component (shown right) above the comment text. Context is a bold title line and optional description line. The context lines do not wrap, they are cut of with an ellipsis.

```hint
As far as I can see in the code, the **Context** is only used to display the comment tag.
```

```react|noSource,span-4
<Comment.Body t={t} comment={comments.comment1} context={commentContext} />
```

```react|noSource,span-2
<>
  <div style={{ marginBottom: 20, background: 'white' }}>
    <Comment.Context {...commentContext} />
  </div>
  <div style={{ marginBottom: 20, background: 'white' }}>
    <Comment.Context title='Wunsch' />
  </div>
</>
```

The body component automatically collapses the text if it's too long. Whether comment bodies are allowed to be collapsed or not is a setting on the Discussion object, which this component gets through the DiscussionContext.

```react|noSource
<Comment.Body t={t} comment={comments.comment5} context={commentContext} />
```

Comments can be unpublished. These comments are still visible, but the content is replaced with a placeholder.

```react|noSource
<Comment.Body t={t} comment={comments.comment2} />
```

If the comment is unpublished by the user themselves, they will still see the content, can edit it and publish again. If the comment was unpublished by an admin the user will see a different note.

```react|noSource,span-3
<Comment.Body t={t} comment={comments.comment3} />
```

```react|noSource,span-3
<Comment.Body t={t} comment={comments.comment4} />
```

Word overflow is prevented with `word-wrap: break-word`.

```react|noSource
<Comment.Body t={t} comment={{
  id: 'monster-id',
  displayAuthor: {
    name: 'Ein Monster'
  },
  upVotes: 8,
  downVotes: 3,
  userVote: 'DOWN',
  published: true,
  createdAt: "2019-01-01",
  updatedAt: "2019-01-01",
  parentIds: [],
  tags: [],
  content: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: 'FrankensteinSuperLangesMonsterWortOverflowVerhinderungsStrategieFrankensteinSuperLangesMonsterWortOverflowVerhinderungsStrategieFrankensteinSuperLangesMonsterWortOverflowVerhinderungsStrategieFrankensteinSuperLangesMonsterWortOverflowVerhinderungsStrategieFrankensteinSuperLangesMonsterWortOverflowVerhinderungsStrategieFrankensteinSuperLangesMonsterWortOverflowVerhinderungsStrategie'
          }
        ]
      }
    ]
  }
}} />
```

#### Actions

The buttons / icons below the comment. The reply button is disabled if the discussion doesn't allow the user to reply at the current time (this information is stored in the DiscussionContext).

```react|noSource,span-2
<Comment.Actions
  t={t}
  comment={comments.comment3}
  onReply={() => {}}
  onEdit={() => {}}
/>
```
```react|noSource,span-2
<Comment.IconLink
  href={""}
  onClick={() => {}}
  discussionCommentsCount={6}
  style={{}}
  small={false}
/>
```


# Composer

#### Header

Looks very similar to the `<Comment>` header, except that the whole element is one big button. Furthermore, if the user doesn't have a crendential yet, we nudge them to set it by using a friendly message in place of the credential description.

```react|noSource,span-2
<Composer.Header
  t={t}
  displayAuthor={{
    name: 'Anonym'
  }}
/>
```

```react|noSource,span-2
<Composer.Header
  t={t}
  displayAuthor={{
    name: 'Ueli Maurer',
    profilePicture: '/static/profilePicture1.png',
    credential: {description: 'Bundesrat', verified: false}
  }}
/>
```

```react|noSource,span-2
<Composer.Header
  t={t}
  displayAuthor={{
    name: 'Queen Daenerys Stormborn of the House Targaryen',
    profilePicture: '/static/profilePicture1.png',
    credential: { description: 'The rightful Queen of the Seven Kingdoms', verified: true }
  }}
/>
```

#### Tags

The tags are an optional elment, shown between the **Header** and the **Textarea** where users enter the text.

```react|noSource,span-4
<Composer.Tags tags={['Lob', 'Kritik', 'Wunsch', 'Keine Angabe']} onChange={() => {}} />
```

```react|noSource,span-2
<Composer.Tags tags={['Lob', 'Kritik', 'Wunsch', 'Keine Angabe']} onChange={() => {}} />
```

#### Actions

The two primary actions on the right (_onClose_, _onSubmit_) are always present. The seconday actions on the left are optional. Use just icons for the secondary actions, and wrap each icon in `<SecondaryAction>`.

`<SecondaryAction>` renders as a button by default, but you can adjust that with the `as` prop. It also sets up CSS for font, color, and hover style to match the primary actions.

```hint
Due to limited space on mobile devices, you can really only put two actions (28px wide) into the secondary actions slot. Make sure you test that everything fits on a 320px wide screen and when the composer is shown in a deeply nested setting (with 5 vertical bars left of it), where the composer is squeezed into 240px.
```

```react|noSource,span-2
<DiscussionContext.Provider
  value={{
    composerSecondaryActions: (
      <>
        <Composer.SecondaryAction><MdMood height={26} width={26} /></Composer.SecondaryAction>
        <Composer.SecondaryAction><MdMarkdown height={26} width={26} /></Composer.SecondaryAction>
      </>
    )
  }}
>
  <Composer.Actions
    t={t}
    onClose={() => {}}
    onCloseLabel="onClose"
    onSubmit={() => {}}
    onSubmitLabel="onSubmit"
  />
</DiscussionContext.Provider>
```

```code|span-4
<SecondaryAction as="a" href="#">…</SecondaryAction>
<SecondaryAction as={Link} to={{ … }}>…</SecondaryAction>
```

#### Error

The error message that is shown at the bottom of the `<CommentComposer>` if creating the comment has failed.

```react|noSource
<Composer.Error>
  Sie sind zu früh. Bitte warten Sie 2 Minuten, bevor Sie wieder kommentieren.
</Composer.Error>
```

# Tree

#### LoadMore

This is a button that shows how many more comments can be loaded at this point in the comment tree. It starts out as just text in primary color. But if a new comment is added to the discussion while the user has the page open, it changes style.

```react|noSource,span-3
<LoadMore1 t={t} count={17} />
```

```react|noSource,span-3
<LoadMore1 t={t} alternative count={18}/>
```
