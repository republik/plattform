```react
state: { numberFormat: '.1f'}
---
<div>
  <ChartEditor value={state} data={data.chartData} onChange={setState} />
  <ErrorBoundary
    key={JSON.stringify(state)}
    showException
    failureMessage={t('styleguide/charts/error')}>
    <CsvChart
      config={{
        "type": "Line",
        ...state
      }}
      values={data.chartData} />
  </ErrorBoundary>
</div>
```
