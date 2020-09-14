Supported props:

- `latestSubscribedArticles` (array), required:
- `latestProgressOrBookmarkedArticles` (array), required:
- `ActionBar` (Component):

```react|responsive
  <TeaserMyMagazine
    latestSubscribedArticles={latestSubscribedArticles}
    latestProgressOrBookmarkedArticles={latestProgressOrBookmarkedArticles}
    ActionBar={
      <span style={{ display: 'flex', marginTop: 16 }}>
        <IconButton Icon={BookmarkIcon} fill="white"/>
        <IconButton
          Icon={() => <ProgressCircle progress={23} size={24} stroke="white" strokePlaceholder="rgba(255,255,255,0.5)" />}
          label="23%"
          labelShort="23%"
          fill="white"
        />
      </span>
    }
  />
```
