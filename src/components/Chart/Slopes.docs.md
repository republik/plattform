```react
<div>
  <Interaction.H2>Lebenserwartung bei Geburt</Interaction.H2>
  <Interaction.P>Ein Vergleich zwischen 1990 und 2015.</Interaction.P>
  <CsvChart t={t}
    config={{
      "type": "Slope",
      "unit": "Jahre",
      "numberFormat": ".1f",
      "zero": false,
      "colorRange": ["#C40046","#F2BF18","#F28502"],
      "color": "gender",
      "colorLegend": false,
      "column": "gender",
      "columnSort": "none"
    }}
    values={`
year,gender,at_age,value
1990,Frau,0,78.42
2015,Frau,0,82.97
1990,Mann,0,71.91
2015,Mann,0,78.13
1990,Total,0,75.35
2015,Total,0,80.57
    `.trim()} />
  <Editorial.Note>Quelle: <Editorial.A href='http://www.humanmortality.de/'>Human Mortality Database</Editorial.A>. University of California, Berkeley (USA) und Max-Planck-Institut </Editorial.Note>
</div>
```

```react
<CsvChart t={t}
    config={{
      "color": "country",
      "colorSort": "none",
      "colorLegend": false,
      "colorRange": [
        "#d62728",
        "#ff7f0e",
        "#1f77b4",
        "#2ca02c"
      ],
      "column": "country",
      "columnSort": "none",
      "numberFormat": ".0%",
      "type": "Slope"
    }}
    values={`
year,country,value
1870,Österreich,0.689443115818244
1870,Deutschland,0.806969593440383
1870,Frankreich,0.814144174923129
1870,Italien,0.51349504612231
2016,Österreich,0.727798978073863
2016,Deutschland,0.75740573054783
2016,Frankreich,0.626705905180777
2016,Italien,0.565762240476037
    `.trim()} />
```

