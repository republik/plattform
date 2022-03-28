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
      ]
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

## Colored Backgrounds

You may add a background color to a column. Supported are `thresholds` and `ordinal` scales.

You can set the default sorting to a specific column by setting `defaultSortColumn` to a column name of your data.

### Thresholds

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
          "column": "Branche",
          "type": "string"
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

### Ordinal Scale

```react
<div>
  <ChartTitle>Öffentlich, privat – oder beides?</ChartTitle>
  <ChartLead>Welche Angebote in den einzelnen europäischen Ländern dominieren</ChartLead>
  <CsvChart
    config={{
      "type": "Table",
      "tableColumns": [
        {
          "column": "Land",
          "type": "string",
        },
        {
          "column": "E-ID-Angebote",
          "type": "string",
          "width": "300",
          "color": true
        }
      ],
      "colorMap": {
        "Öffentliche Angebote dominieren": "#66c2a5",
        "Öffentliche und private": "#fc8d62",
        "Private Angebote dominieren": "#8da0cb"
        },
        "collapsedState": "auto"
    }}
    values={`
Land,E-ID-Angebote
Kroatien,Öffentliche Angebote dominieren
Belgien,Öffentliche und private
Dänemark,Private Angebote dominieren
Deutschland,Öffentliche und private
Estland,Öffentliche Angebote dominieren
Frankreich,Öffentliche und private
Grossbritannien,Private Angebote dominieren
Italien,Öffentliche und private
Lettland,Öffentliche und private
Litauen,Öffentliche Angebote dominieren
Luxemburg,Öffentliche und private
Malta,Öffentliche Angebote dominieren
Niederlande,Öffentliche und private
Norwegen,Öffentliche und private
Österreich,Öffentliche und private
Polen,Öffentliche Angebote dominieren
Portugal,Öffentliche Angebote dominieren
Schweden,Öffentliche und private
Schweiz,Private Angebote dominieren
Slowakei,Öffentliche Angebote dominieren
Spanien,Öffentliche Angebote dominieren
Tschechien,Öffentliche und private
Slowenien,Öffentliche und private
Finnland,Öffentliche und private
Zypern,Öffentliche Angebote dominieren
    `.trim()} />
  <ChartLegend></ChartLegend>
</div>
```
