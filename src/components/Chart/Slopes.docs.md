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
