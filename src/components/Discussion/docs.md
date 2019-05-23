We use React Context to make static properties and discussion-wide callbacks available to components. So make sure to wrap the components in `<DiscussionContext.Provider>` before you render `<CommentList>`

```code|lang-js
<DiscussionContext.Provider value={{ … }}>
  <CommentList … />
</DiscussionContext.Provider>
```

### Configuration

Some config options are stored in `src/components/Discussion/config.js`. If you need to tweak the layout, first have a look there if there is already an option for it.

### Exports

The following symbols are exported from the styleguide:

 * `DiscussionContext`

 * `<CommentComposerPlaceholder>`
 * `<CommentComposer>`
 * `<CommentComposerSecondaryAction>`

 * `<CommentList>`