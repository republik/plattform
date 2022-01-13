```react
state: {
  type: 'TimeBar',
  activeTab: 'basic',
  tabs: [
    { value: 'basic', text: 'Grundeinstellungen' },
    {
      value: 'advanced',
      text: 'Erweiterte Optionen'
    }
  ]
}
---
<div>
  <Scroller activeChildIndex={state.tabs.findIndex(({ value }) => value === state.activeTab)}>
    {state.tabs.map(({ value, text }) => (
      <TabButton
        key={value}
        text={text}
        isActive={state.activeTab === value}
        onClick={() => {
          setState({ activeTab: value })
        }}
      />
    ))}
  </Scroller>
  <br />
  <ChartEditor
    activeTab={state.activeTab}
    value={state}
    data={data.chartData}
    onChange={setState} />
  <ErrorBoundary
    key={JSON.stringify(state)}
    showException
    failureMessage={t('styleguide/charts/error')}>
    <CsvChart
      config={state}
      values={data.chartData} />
  </ErrorBoundary>
</div>
```
