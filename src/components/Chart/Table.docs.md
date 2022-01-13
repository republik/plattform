```react
<div>
  <ChartTitle>Ländervergleich</ChartTitle>
  <CsvChart
    config={{
      "type": "Table",
      "unit": "Sitze",
      "colorRange": "sequential",
      "colorBy": "value",
      "numberFormat": "s",
      "labelCells": ['Indikator']
    }}
    values={`
Indikator,Afghanistan,Schweiz
Gesamtbevölkerung,38,8.6
"BNE pro Kopf (USD, kaufkraftbereinigt)",2229,69394
"Kindersterblichkeit (pro 1000 Kindern unter 5 Jahren)",62.3,4.1
"Jahre in der Schule (Mittelwert)",3.9,13.4
    `.trim()} />
  <ChartLegend>Quelle: Entwicklungsprogramm der Vereinten Nationen.</ChartLegend>
</div>
```
