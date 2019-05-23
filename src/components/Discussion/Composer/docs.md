```remove-react-source
```

## `<CommentComposer>`

The `<CommentComposer>` is a stateful component which manages the input text and selected tag. The following callbacks are used to communicate with its controller:

 * `onClose(): void`
 * `onSubmit({ text: string, tags?: string[] }): Promise<{}>`
 * `onEditPreferences(): void`

The `onSubmit()` function must return a Promise which is resolved when the backend accepts the comment, or is rejected with a string that describes the error. The error will then be shown below the form, the user can further edit the comment and try to submit again.

```react|noSource,plain
<CommentComposerPlayground />
```

## `<CommentComposerPlaceholder>`

Same height as the `<Header>` in the `<CommentComposer>` so that it can be used in its place and we can have a nice transition between the placeholder and the whole `<CommentComposer>` component.

```react|noSource,plain
<CommentComposerPlaceholder
  t={t}
  displayAuthor={{ profilePicture: '/static/profilePicture1.png' }}
  onClick={() => {}}
/>
```
