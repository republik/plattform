```react
<div>
  <ChartTitle>Sitzverteilung im Nationalrat</ChartTitle>
  <ChartLead>Gruppiert nach Parteien</ChartLead>
  <CsvChart
    config={{
      "type": "Hemicycle",
      "unit": "Sitze"
    }}
    values={`
label,year,value
SP,2015,43
PdA,2015,1
GPS,2015,11
CVP,2015,27
glp,2015,7
EVP,2015,2
BDP,2015,7
FDP,2015,33
Lega,2015,2
CSP,2015,1
MCR,2015,1
SVP,2015,65
SP,2011,46
GPS,2011,15
CVP,2011,28
glp,2011,12
EVP,2011,2
BDP,2011,9
FDP,2011,30
Lega,2011,2
CSP,2011,1
MCR,2011,1
SVP,2011,65
    `.trim()} />
  <Editorial.Note>Quelle: BFS.</Editorial.Note>
</div>
```
# Single

```react
<div>
  <ChartTitle>Sitzverteilung im Nationalrat</ChartTitle>
  <ChartLead>Gruppiert nach Parteien</ChartLead>
  <CsvChart
    config={{
      "type": "Hemicycle",
      "unit": "Sitze",
      "inlineLabelThreshold": 6
    }}
    values={`
label,year,value
SP,2015,43
PdA,2015,1
GPS,2015,11
CVP,2015,27
glp,2015,7
EVP,2015,2
BDP,2015,7
FDP,2015,33
Lega,2015,2
CSP,2015,1
MCR,2015,1
SVP,2015,65
    `.trim()} />
  <Editorial.Note>Quelle: BFS.</Editorial.Note>
</div>
```

# Custom

```react
<div>
  <ChartTitle>Buchstabensalat</ChartTitle>
  <CsvChart
    config={{
      "type": "Hemicycle",
      "padding": 20,
      "inlineLabelThreshold": 2,
      "middleAnnotation": "Absolutes Mehr",
      "colorMap": {
        "ABCD": "red",
        "EFGH": "orange",
        "IJKL": "yellow",
        "MNOP": "green",
        "QRST": "blue"
      }
    }}
    values={`
label,value
ABCD,3
EFGH,15
IJKL,1
MNOP,25
QRST,3
    `.trim()} />
</div>
```
