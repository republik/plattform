```react
<div>
  <Interaction.H2>Abgabenquote im internationalen Vergleich</Interaction.H2>
  <Interaction.P>in Prozent des BIP 2015</Interaction.P>
  <CsvChart t={t}
    config={{
      type: 'Bar',
      numberFormat: '.0%',
      y: 'country',
      category: "datum.country == 'Schweiz' ? '1' : '0'",
      showBarValues: true
    }}
    values={`
country,value
Frankreich,0.455
Österreich,0.435
Italien,0.433
Deutschland,0.369
Schweiz,0.279
USA,0.264
Irland,0.236
    `.trim()} />
  <Editorial.Note>Quelle: OECD 2015. Revenue Statistics 1965-2014. Bundesministerium der Finanzen 2016. Die wichtigsten Steuern im internationalen Vergleich 2015.</Editorial.Note>
</div>
```

## Columns

```react
<div>
  <Interaction.H2>Themenstruktur der verschiedenen Formen der Weiterbildung 2014</Interaction.H2>
  <Interaction.P>in Prozent</Interaction.P>
  <CsvChart t={t}
    config={{
      type: 'Bar',
      color: 'type',
      colorSort: 'none',
      numberFormat: '%',
      sort: 'none',
      column: 'type',
      y: 'category',
      columns: 3,
      minInnerWidth: 250
    }}
    values={`
category,type,value
"Sprachen, Kultur, Politik",Nicht-berufsbezogene Weiterbildung,0.32
Pädagogik und Sozialkompetenz,Nicht-berufsbezogene Weiterbildung,0.07
Gesundheit und Sport,Nicht-berufsbezogene Weiterbildung,0.26
"Wirtschaft, Arbeit, Recht",Nicht-berufsbezogene Weiterbildung,0.12
"Natur, Technik, Computer",Nicht-berufsbezogene Weiterbildung,0.23
nicht oder nur einstellig klassifizierbar,Nicht-berufsbezogene Weiterbildung,0.01
"Sprachen, Kultur, Politik",Individuelle berufsbezogene Weiterbildung,0.15
Pädagogik und Sozialkompetenz,Individuelle berufsbezogene Weiterbildung,0.17
Gesundheit und Sport,Individuelle berufsbezogene Weiterbildung,0.21
"Wirtschaft, Arbeit, Recht",Individuelle berufsbezogene Weiterbildung,0.26
"Natur, Technik, Computer",Individuelle berufsbezogene Weiterbildung,0.17
nicht oder nur einstellig klassifizierbar,Individuelle berufsbezogene Weiterbildung,0.04
"Sprachen, Kultur, Politik",Betriebliche Weiterbildung,0.05
Pädagogik und Sozialkompetenz,Betriebliche Weiterbildung,0.07
Gesundheit und Sport,Betriebliche Weiterbildung,0.19
"Wirtschaft, Arbeit, Recht",Betriebliche Weiterbildung,0.41
"Natur, Technik, Computer",Betriebliche Weiterbildung,0.24
nicht oder nur einstellig klassifizierbar,Betriebliche Weiterbildung,0.04
    `.trim()} />
  <Editorial.Note>Quelle: Adult Education Survey 2014.</Editorial.Note>
</div>
```

## Stacked with a Legend

```react
<div>
  <Interaction.H2>Kriminalitätsfurcht 2012</Interaction.H2>
  <CsvChart t={t}
    config={{
      type: 'Bar',
      numberFormat: "%",
      color: "concern",
      colorRange: "diverging2",
      colorLegend: true,
      y: "category",
      domain: [0, 1],
      sort: "none",
      colorSort: "none",
      highlight: "datum.category == 'Allgemein'"
    }}
    values={`
category,concern,value
Allgemein,gar nicht,0.416
Allgemein,etwas,0.413
Allgemein,ziemlich,0.124
Allgemein,sehr stark,0.047
Körperverletzung,gar nicht,0.535
Körperverletzung,etwas,0.299
Körperverletzung,ziemlich,0.073
Körperverletzung,sehr stark,0.093
Einbruch,gar nicht,0.427
Einbruch,etwas,0.39
Einbruch,ziemlich,0.077
Einbruch,sehr stark,0.107
Raub,gar nicht,0.464
Raub,etwas,0.352
Raub,ziemlich,0.074
Raub,sehr stark,0.11
Sexuelle Belästigung,gar nicht,0.692
Sexuelle Belästigung,etwas,0.167
Sexuelle Belästigung,ziemlich,0.047
Sexuelle Belästigung,sehr stark,0.093
    `.trim()} />
  <Editorial.Note>Quelle: Deutscher Viktimisierungssurvey 2012.</Editorial.Note>
</div>
```
