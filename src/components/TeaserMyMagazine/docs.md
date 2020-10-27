Supported props:

- `latestSubscribedArticles` (array), required:
- `latestProgressOrBookmarkedArticles` (array), required:
- `ActionBar` (Component):

```react|responsive
  <TeaserMyMagazine
    latestSubscribedArticles={latestSubscribedArticles}
    latestProgressOrBookmarkedArticles={latestProgressOrBookmarkedArticles}
    bookmarksUrl="/lesezeichen"
    notificationsUrl="/benachrichtigungen"
    bookmarksLabel="Alle Beiträge zum Weiterlesen"
    title="Meine Republik"
    notificationsLabel="Neuste abonnierte Beiträge"
    ActionBar={ () => (
      <span style={{ display: 'flex' }}>
        <IconButton Icon={BookmarkIcon} fill="black"/>
        <IconButton
          Icon={() => <ProgressCircle progress={23} size={24} stroke="black" strokePlaceholder="rgba(255,255,255,0.5)" />}
          label="23%"
          labelShort="23%"
          fill="black"
        />
      </span>
      )
    }
  />
```
