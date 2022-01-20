## Simple table

```react
<div>
  <ChartTitle>Ländervergleich</ChartTitle>
  <CsvChart
    config={{
      "type": "Table",
      "numberFormat": "s",
      "tableColumns": [
        {
          "column": "Indikator",
          "type": "string"
        },
        {
          "column": "Afghanistan",
          "type": "number",
          "width": "170"
        },
        {
          "column": "Schweiz",
          "type": "number",
          "width": "170"
        }
      ],
      "enableSorting": false
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

## Table with background color and sorting

```react
<div>
  <ChartTitle>Viel Gesundheit, wenig Energie</ChartTitle>
  <ChartLead>Über- bzw. Untergewichtung von Sektoren im PAB</ChartLead>
  <CsvChart
    config={{
      "type": "Table",
      "colorRange": [
        "#762a83", "#af8dc3", "#e7d4e8", "#d9f0d3", "#7fbf7b", "#1b7837"
        ],
      "thresholds": [-0.5, -0.3, 0, 0.3, 0.5],
      "tableColumns": [
        {
          "column": "Branch",
          "type": "string",
        },
        {
          "column": "Gewichtung",
          "type": "number",
          "width": "170",
          "color": true
        }
      ],
      "numberFormat": "+.0%",
      "defaultSortColumn": "Gewichtung"
    }}
    values={`
Branche,Gewichtung
Gesundheit,0.34
Langlebige Haushaltswaren,0.30
Finanz,0.17
Telecom,0.07
Technologie,-0.03
Basiskonsumgüter,-0.08
Industrie,-0.18
Bau und Immobilien,-0.34
Materialien,-0.38
Versorger,-0.51
Energie,-0.52
    `.trim()} />
  <ChartLegend>Lesebeispiel: Der Gesundheitssektor ist im Paris-Aligned Benchmark gegenüber dem Stoxx Europe 600 Basisindex um 34 Prozent übergewichtet. Quelle: Stoxx.</ChartLegend>
</div>
```
