```react
state: { type: 'TimeBar'}
---
<div>
  <ChartEditor value={state} data={data.chartData} onChange={setState} />
  <ErrorBoundary
    key={JSON.stringify(state)}
    showException
    failureMessage={t('styleguide/charts/error')}>
    <CsvChart
      config={{
        ...state
      }}
      values={data.chartData} />
  </ErrorBoundary>
</div>
```
