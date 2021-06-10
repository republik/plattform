# Series Navigation

```react|responsive
  <SeriesNav
    documentId={documentId}
    series={series}
    ActionBar={ () => (
      <span style={{ display: 'flex' }}>
        <IconButton Icon={ReadingTimeIcon} label="10'" labelShort="10'" />
        <IconButton Icon={BookmarkIcon}/>
        <IconButton
          Icon={() => <ProgressCircle progress={23} size={24} />}
          label="23%"
          labelShort="23%"
        />
        <IconButton fill="#00AA00" Icon={DiscussionIcon} label="30" labelShort="30" />
      </span>
      )
    }
    PayNote={TestPayNote}
  />
```

Inline

```react|responsive
  <SeriesNav
    documentId={documentId}
    series={series}
    inline={true}
    PayNote={TestPayNote}
  />
```
