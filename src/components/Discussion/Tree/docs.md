```remove-react-source

```

The `<CommentList>` component is used to render the discussion comment tree. It starts by rendering the list of root-level comments, and recursively renders all children.

```code|lang-js
<CommentList t={t} comments={{ totalCount, directTotalCount, pageInfo, nodes }} />
```

The internal `<CommentNode>` component is responsible for rendering a comment and its children. It is stateful, it manages the presence of composers (to edit the comment itself and to write a reply to the comment), and also whether the children are expanded (visible) or not.

### Example

Two root-level components and one more that can be loaded.

```react|noSource
<CommentList
  t={t}
  comments={{
    totalCount: 3,
    directTotalCount: 3,
    nodes: [comments.comment0, comments.comment1]
  }}
/>
```

### Example with link preview

```react|noSource
<CommentList
  t={t}
  board
  comments={{
    totalCount: 2,
    directTotalCount: 2,
    nodes: [comments.comment10, comments.comment11]
  }}
/>
```

### Complex Discussion Tree

```react|noSource
<CommentList
  t={t}
  comments={{
    totalCount: 281,
    directTotalCount: 72,
    nodes: [
      comments.comment5,
      comments.comment6,
      comments.comment9
    ]
  }}
/>
```
