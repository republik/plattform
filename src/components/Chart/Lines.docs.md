```react
<div>
  <Interaction.H2>Entwicklung der Lebenserwartung bei Geburt</Interaction.H2>
  <CsvChart t={t}
    config={{
      "type": "Line",
      "unit": "Jahre",
      "numberFormat": ".1f",
      "zero": false,
      "colorRange": ["#C40046","#F2BF18","#F28502"],
      "category": "datum.gender"
    }}
    values={`
year,gender,at_age,value
1990,Frau,0,78.42
1991,Frau,0,78.68
1992,Frau,0,79.14
1993,Frau,0,79.21
1994,Frau,0,79.51
1995,Frau,0,79.69
1996,Frau,0,79.86
1997,Frau,0,80.27
1998,Frau,0,80.54
1999,Frau,0,80.74
2000,Frau,0,80.99
2001,Frau,0,81.28
2002,Frau,0,81.29
2003,Frau,0,81.37
2004,Frau,0,81.89
2005,Frau,0,81.97
2006,Frau,0,82.24
2007,Frau,0,82.41
2008,Frau,0,82.4
2009,Frau,0,82.49
2010,Frau,0,82.62
2011,Frau,0,82.83
2012,Frau,0,82.94
2013,Frau,0,82.86
2014,Frau,0,83.33
2015,Frau,0,82.97
1990,Mann,0,71.91
1991,Mann,0,72.09
1992,Mann,0,72.53
1993,Mann,0,72.63
1994,Mann,0,72.95
1995,Mann,0,73.12
1996,Mann,0,73.42
1997,Mann,0,73.87
1998,Mann,0,74.31
1999,Mann,0,74.56
2000,Mann,0,74.85
2001,Mann,0,75.27
2002,Mann,0,75.44
2003,Mann,0,75.52
2004,Mann,0,76.16
2005,Mann,0,76.37
2006,Mann,0,76.76
2007,Mann,0,76.93
2008,Mann,0,77.12
2009,Mann,0,77.25
2010,Mann,0,77.45
2011,Mann,0,77.78
2012,Mann,0,77.97
2013,Mann,0,77.99
2014,Mann,0,78.43
2015,Mann,0,78.13
1990,Total,0,75.35
1991,Total,0,75.56
1992,Total,0,76.01
1993,Total,0,76.09
1994,Total,0,76.39
1995,Total,0,76.56
1996,Total,0,76.79
1997,Total,0,77.22
1998,Total,0,77.57
1999,Total,0,77.8
2000,Total,0,78.06
2001,Total,0,78.41
2002,Total,0,78.48
2003,Total,0,78.55
2004,Total,0,79.13
2005,Total,0,79.26
2006,Total,0,79.6
2007,Total,0,79.75
2008,Total,0,79.83
2009,Total,0,79.93
2010,Total,0,80.09
2011,Total,0,80.36
2012,Total,0,80.5
2013,Total,0,80.46
2014,Total,0,80.92
2015,Total,0,80.57
    `.trim()} />
  <Editorial.Note>Quelle: <Editorial.A href='http://www.humanmortality.de/'>Human Mortality Database</Editorial.A>. University of California, Berkeley (USA) und Max-Planck-Institut </Editorial.Note>
</div>
```
