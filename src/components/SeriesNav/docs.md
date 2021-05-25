# Series Navigation

```react
  <SeriesNav
    document={document}
    height={500}
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
  />
```

Inline

```react
  <SeriesNav
    document={document}
    inline={true}
  />
```
