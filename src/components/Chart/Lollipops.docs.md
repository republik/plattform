Lollipop charts are just lighter bar charts. The circle at the end makes it ideal for displaying uncertainty.

```react
<div>
  <ChartTitle>Armutsrisikoquote nach Altersgruppen 2014</ChartTitle>
  <CsvChart t={t}
    config={{
      type: 'Lollipop',
      numberFormat: '%',
      y: 'facet_value',
      sort: 'none'
    }}
    values={`
facet,facet_value,year,value,confidence95_lower,confidence95_upper
Altersgruppen,unter 10 Jahre,2014,0.219,0.207,0.232
Altersgruppen,10-17 Jahre,2014,0.201,0.183,0.219
Altersgruppen,18-24 Jahre,2014,0.243,0.194,0.292
Altersgruppen,25-34 Jahre,2014,0.208,0.189,0.226
Altersgruppen,35-44 Jahre,2014,0.128,0.113,0.144
Altersgruppen,45-54 Jahre,2014,0.106,0.083,0.130
Altersgruppen,55-64 Jahre,2014,0.132,0.112,0.151
Altersgruppen,65-74 Jahre,2014,0.141,0.110,0.171
Altersgruppen,über 74 Jahre,2014,0.133,0.120,0.146
    `.trim()} />
  <Editorial.Note>Quelle: Berechnungen des DIW Berlin, SOEPv32.1.</Editorial.Note>
</div>
```
