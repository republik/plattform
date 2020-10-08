```react
<div>
  <ChartTitle>Abgabenquote im internationalen Vergleich</ChartTitle>
  <ChartLead>in Prozent des BIP 2015</ChartLead>
  <CsvChart
    config={{
      "type": "Bar",
      "numberFormat": ".0%",
      "y": "country",
      "category": "datum.country == 'Schweiz' ? '1' : '0'",
      "showBarValues": true
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
  <ChartLegend>Quelle: OECD 2015. Revenue Statistics 1965-2014. Bundesministerium der Finanzen 2016. Die wichtigsten Steuern im internationalen Vergleich 2015.</ChartLegend>
</div>
```

## Columns

```react
<div>
  <ChartTitle>Themenstruktur der verschiedenen Formen der Weiterbildung 2014</ChartTitle>
  <ChartLead>in Prozent</ChartLead>
  <CsvChart
    config={{
      "type": "Bar",
      "color": "type",
      "colorSort": "none",
      "numberFormat": "%",
      "sort": "none",
      "column": "type",
      "y": "category",
      "columns": 3,
      "minInnerWidth": 250
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
  <ChartLegend>Quelle: Adult Education Survey 2014.</ChartLegend>
</div>
```

## Stacked with a Legend

```react
<div>
  <ChartTitle>Kriminalitätsfurcht 2012</ChartTitle>
  <CsvChart
    config={{
      "type": "Bar",
      "numberFormat": "%",
      "color": "concern",
      "colorRange": "diverging2",
      "colorLegend": true,
      "y": "category",
      "domain": [0, 1],
      "sort": "none",
      "colorSort": "none",
      "highlight": "datum.category == 'Allgemein'"
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
  <ChartLegend>Quelle: Deutscher Viktimisierungssurvey 2012.</ChartLegend>
</div>
```

Use `colorLegendValues` to only label specific colors:

```react
<div>
  <CsvChart
    config={{
      "type": "Bar",
      "numberFormat": "%",
      "color": "concern",
      "colorRange": [
        "#3D155B", "#542785", "#A46FDA", "#C79CF0",
        "#bbb", "#bbb",
        "#D6FA90", "#B9EB56", "#90AA00", "#62790E"
      ],
      "colorLegend": true,
      "colorLegendValues": ["weniger", "gleich", "mehr"],
      "domain": [0, 1],
      "sort": "none",
      "colorSort": "none"
    }}
    values={`
concern,value
weniger,0.1
0.1,0.1
0.2,0.1
0.3,0.1
gleich,0.1
0.5,0.1
0.6,0.1
0.7,0.1
0.8,0.1
mehr,0.1
    `.trim()} />
</div>
```

## Inline Values and Labels

```react
<div>
  <ChartTitle>Velobeschluss</ChartTitle>
  <ChartLead>Angenommen mit 73.6% Ja</ChartLead>
  <CsvChart
    config={{
      "type": "Bar",
      "numberFormat": ".1%",
      "color": "vote",
      "colorRange": "diverging1",
      "inlineValue": true,
      "inlineLabel": "vote",
      "inlineSecondaryLabel": "count",
      "y": "canton"
    }}
    values={`
canton,vote,value,count
,Ja,0.736,1 475 165 Stimmen
,Nein,0.264,529 268 Stimmen
Zürich,Ja,0.719,
Zürich,Nein,0.281,
Bern,Ja,0.722,
Bern,Nein,0.278,
Luzern,Ja,0.687,
Luzern,Nein,0.313,
    `.trim()} />
  <ChartLegend>Quelle: <Editorial.A href="https://www.bk.admin.ch/ch/d/pore/va/20180923/det620.html">Bundeskanzlei</Editorial.A></ChartLegend>
</div>
```

## Links

```react
<div>
  <ChartTitle>Häufigste Namen bei der Republik</ChartTitle>
  <CsvChart
    config={{
      "type": "Bar",
      "numberFormat": "s",
      "sort": "descending",
      "link": "href",
      "inlineValue": true,
      "inlineValueUnit": "Konten",
      "y": "name"
    }}
    values={`
name,value,href
Thomas,494,https://www.republik.ch/~tpreusse
Peter,464
Daniel,415,https://www.republik.ch/~daniel
    `.trim()} />
  <ChartLegend>Quelle: <Editorial.A href="https://www.bk.admin.ch/ch/d/pore/va/20180923/det620.html">Bundeskanzlei</Editorial.A></ChartLegend>
</div>
```

## Negative Values

```react
<div>
  <ChartTitle>Wie positiv ist Alkoholkonsum?</ChartTitle>
  <ChartLead>Konstruktivität durch scharfe, negative Kritik</ChartLead>
  <CsvChart
    config={{
      "type": "Bar",
      "numberFormat": ".0%",
      "y": "alk",
      "showBarValues": true,
      "domain": [-1, 0],
      "sort": "none"
    }}
    values={`
alk,value
Bier,-0.05
Wein<sub>en</sub>,-0.13
Vodka,-0.4
Absinth,-0.8
    `.trim()} />
</div>
```

## Advanced Labeling

By default the first and middle bar segment labels are `left` and the last (if not also the first) is `right` ordiented. For negative values `right` and `left` are flipped.

If needed this can be overwritten with a custom `inlineLabelPosition`. Valid values are: `left`, `right`, `center`.

```react
<div>
  <CsvChart
    config={{
      "type": "Bar",
      "y": "category",
      "sort": "none",
      "colorSort": "none",
      "color": "label",
      "colorRange": [
        "#fdd49e", "#fdbb84", "#fc8d59"
      ],
      "inlineValue": true,
      "inlineLabel": "label",
      "inlineLabelPosition": "pos"
    }}
    values={`
category,value,label,pos
Ca. 3500 Kilometer mehr mit ÖV,79,a,
8 bis 15 Stunden mehr Flug pro Jahr,2074,a,center
9 bis 16 Stunden mehr Flug pro Jahr,2074,a,
9 bis 16 Stunden mehr Flug pro Jahr,200,b,
10 bis 16 Stunden mehr Flug pro Jahr,2074,a,
10 bis 16 Stunden mehr Flug pro Jahr,200,b,right
10 bis 16 Stunden mehr Flug pro Jahr,200,c,left
Verzicht auf 10 bis 16 Stunden Flug pro Jahr,-2074,a,
Verzicht auf 10 bis 16 Stunden Flug pro Jahr,-200,b,left
Verzicht auf 10 bis 16 Stunden Flug pro Jahr,-200,c,right
Verzicht auf 9 bis 16 Stunden Flug pro Jahr,-2074,a,
Verzicht auf 9 bis 16 Stunden Flug pro Jahr,-200,b,
Verzicht auf 8 bis 15 Stunden Flug pro Jahr,-2074,a,center
Verzicht auf ca. 3500 Kilometer mit ÖV,-79,a,
    `.trim()} />
</div>
```

