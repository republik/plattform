export const chartTypes = [
  'Bar',
  'TimeBar',
  'Lollipop',
  'Line',
  'Slope',
  'ScatterPlot',
  'ProjectedMap',
  'SwissMap',
  'Hemicycle'
]

export const chartData = {
  Bar: {
    config: {
      type: 'Bar',
      numberFormat: '.0%',
      y: 'country',
      category: "datum.country == 'Schweiz' ? '1' : '0'",
      showBarValues: true
    },
    values: `
country,value
Frankreich,0.455
Österreich,0.435
Italien,0.433
Deutschland,0.369
Schweiz,0.279
USA,0.264
Irland,0.236
`
  },
  TimeBar: {
    config: {
      type: 'TimeBar',
      color: 'gas',
      unit: 'Tonnen',
      numberFormat: '.3s',
      xAnnotations: [
        {
          x1: '2008',
          x2: '2012',
          value: 973619338.97,
          unit: 'Tonnen',
          label: 'Kyoto-Protokoll'
        },
        { x: '2020', value: 748700000, label: 'Ziel 2020', ghost: true },
        {
          x: '2050',
          value: 249600000,
          label: 'Ziel 2050',
          valuePrefix: 'max: ',
          ghost: true
        }
      ],
      padding: 18
    },
    values: `
gas,year,value
Kohlendioxid*,2000,899286373.4247
Kohlendioxid*,2001,915635782.3067
Kohlendioxid*,2002,899162846.9360
Kohlendioxid*,2003,900378826.0060
Kohlendioxid*,2004,886210543.4303
Kohlendioxid*,2005,865865731.8721
Kohlendioxid*,2006,877369259.7152
Kohlendioxid*,2007,850743081.2561
Kohlendioxid*,2008,853591912.0905
Kohlendioxid*,2009,788509961.0264
Kohlendioxid*,2010,832436646.1019
Kohlendioxid*,2011,812577106.3051
Kohlendioxid*,2012,817145149.9304
Kohlendioxid*,2013,835459056.9882
Kohlendioxid*,2014,794828966.5949
Kohlendioxid*,2015,792054499.4077
Kohlendioxid*,2016,795883114.0371
Methan,2000,87736381.2314
Methan,2001,84091446.2041
Methan,2002,80135956.5878
Methan,2003,76774984.9321
Methan,2004,71733432.6432
Methan,2005,68477832.4964
Methan,2006,64573063.7325
Methan,2007,62274660.8729
Methan,2008,61333391.6421
Methan,2009,59101276.1206
Methan,2010,58259552.5933
Methan,2011,57135547.1563
Methan,2012,57778036.5857
Methan,2013,57171494.8786
Methan,2014,56008971.5470
Methan,2015,55616081.8986
Methan,2016,55400233.0731
Lachgas,2000,43088366.1610
Lachgas,2001,44490572.9269
Lachgas,2002,43677056.7886
Lachgas,2003,43298494.2715
Lachgas,2004,45468448.1050
Lachgas,2005,43455061.0990
Lachgas,2006,43175498.9384
Lachgas,2007,45096606.3853
Lachgas,2008,45599019.9048
Lachgas,2009,44807381.9458
Lachgas,2010,36793777.0214
Lachgas,2011,38194521.9988
Lachgas,2012,37353671.2651
Lachgas,2013,37924829.4528
Lachgas,2014,38590323.9573
Lachgas,2015,39078194.8219
Lachgas,2016,38919411.8479
HFKW,2000,7806423.8558
HFKW,2001,9128533.9852
HFKW,2002,9901627.4058
HFKW,2003,9318796.4817
HFKW,2004,9617818.7572
HFKW,2005,9940244.3478
HFKW,2006,10161906.4614
HFKW,2007,10448193.8975
HFKW,2008,10588831.6058
HFKW,2009,11170477.6991
HFKW,2010,10752937.3698
HFKW,2011,10953041.4476
HFKW,2012,11140270.3677
HFKW,2013,11096125.7337
HFKW,2014,11182899.5065
HFKW,2015,11355513.2445
HFKW,2016,11300000.0000
FKW,2000,958683.7702
FKW,2001,872061.5626
FKW,2002,948046.4714
FKW,2003,1017867.7713
FKW,2004,979676.2340
FKW,2005,839439.2561
FKW,2006,670798.1140
FKW,2007,589326.1735
FKW,2008,567648.0811
FKW,2009,407205.9609
FKW,2010,345886.1545
FKW,2011,278950.2585
FKW,2012,242576.5983
FKW,2013,257269.9702
FKW,2014,234604.2762
FKW,2015,253667.4182
FKW,2016,280000.0000
Schwefelhexafluorid,2000,4072497.7837
Schwefelhexafluorid,2001,3751778.6843
Schwefelhexafluorid,2002,3087040.2801
Schwefelhexafluorid,2003,3034157.6876
Schwefelhexafluorid,2004,3243551.2457
Schwefelhexafluorid,2005,3319866.5921
Schwefelhexafluorid,2006,3241500.8614
Schwefelhexafluorid,2007,3180593.2862
Schwefelhexafluorid,2008,2971212.8200
Schwefelhexafluorid,2009,2923979.0760
Schwefelhexafluorid,2010,3100035.6838
Schwefelhexafluorid,2011,3162999.7285
Schwefelhexafluorid,2012,3154891.7700
Schwefelhexafluorid,2013,3261145.7983
Schwefelhexafluorid,2014,3396171.8068
Schwefelhexafluorid,2015,3561670.3612
Schwefelhexafluorid,2016,3750000.0000
Stickstofftrifluorid,2000,8916.0500
Stickstofftrifluorid,2001,7820.2667
Stickstofftrifluorid,2002,12219.1667
Stickstofftrifluorid,2003,19377.2333
Stickstofftrifluorid,2004,22814.3667
Stickstofftrifluorid,2005,34489.4400
Stickstofftrifluorid,2006,27839.9200
Stickstofftrifluorid,2007,12022.8000
Stickstofftrifluorid,2008,29595.8680
Stickstofftrifluorid,2009,29081.3333
Stickstofftrifluorid,2010,61433.6667
Stickstofftrifluorid,2011,61206.6667
Stickstofftrifluorid,2012,35207.0000
Stickstofftrifluorid,2013,16030.4000
Stickstofftrifluorid,2014,20278.8000
Stickstofftrifluorid,2015,11885.2000
Stickstofftrifluorid,2016,12000.0000
`
  },
  Lollipop: {
    config: {
      type: 'Lollipop',
      y: 'category',
      sort: 'none',
      band: 'Q',
      bandLegend: 'in diesem Bereich liegt die Hälfte aller Löhne',
      domain: [0, 15000],
      unit: 'CHF',
      xTicks: [0, 6502, 10000, 15000]
    },
    values: `
category,value,Q_lower,Q_upper
Informationstechnologie,8900,6918,11373
Forschung und Entwicklung,8764,7143,11837
Energieversorgung,8210,6873,10182
`
  },
  Line: {
    config: {
      type: 'Line',
      unit: 'Jahre',
      numberFormat: '.1f',
      zero: false,
      colorRange: ['#C40046', '#F2BF18', '#F28502'],
      category: 'datum.gender'
    },
    values: `
year,gender,at_age,value
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
`
  },
  Slope: {
    config: {
      color: 'country',
      colorSort: 'none',
      colorLegend: false,
      colorRange: ['#d62728', '#ff7f0e', '#1f77b4', '#2ca02c'],
      column: 'country',
      columns: 4,
      columnSort: 'none',
      numberFormat: '.0%',
      type: 'Slope'
    },
    values: `
year,country,value
1870,Österreich,0.689443115818244
1870,Deutschland,0.806969593440383
1870,Frankreich,0.814144174923129
1870,Italien,0.51349504612231
2016,Österreich,0.727798978073863
2016,Deutschland,0.75740573054783
2016,Frankreich,0.626705905180777
2016,Italien,0.565762240476037
`
  },
  ScatterPlot: {
    config: {
      type: 'ScatterPlot',
      label: 'geo',
      color: 'region',
      x: 'income pp 2014',
      y: 'co2 pp 2014',
      yUnit: 'tons of CO<sub>2</sub>',
      xUnit: 'GDP per capita (USD)',
      yNumberFormat: '.2f',
      yScale: 'log',
      xScale: 'log',
      tooltipLabel: 'The case of {geo}',
      tooltipBody:
        'Average Joe in {geo} emitted {formattedY} tons of CO<sub>2</sub> in 2014.\nIn the same period of time, Joe worked and worked and earned himself {formattedX} USD.'
    },
    values: `
geo,income pp 2014,co2 pp 2014,region
Liberia,805,0.213,Africa
Libya,15100,9.19,Africa
Lithuania,26300,4.33,FSU
Luxembourg,93800,17.4,Europe
"Macedonia, FYR",12300,3.61,Asia
Madagascar,1370,0.13,Africa
Malawi,1090,0.0748,Africa
Malaysia,24200,8.03,Asia
Maldives,11900,3.27,Asia
Mali,1870,0.0832,Africa
Malta,32300,5.51,Europe
Marshall Islands,3660,1.94,Europe
Mauritania,3660,0.667,Africa
Mauritius,18300,3.36,Africa
Mexico,16500,3.87,Americas
"Micronesia, Fed. Sts.",3180,1.45,Oceania
Moldova,4760,1.21,Europe
Monaco,58300,1.21,Europe
Mongolia,11300,7.13,Asia
Montenegro,14800,3.52,Europe
Morocco,7070,1.74,Africa
Mozambique,1080,0.31,Africa
Myanmar,4770,0.417,Asia
Namibia,9630,1.58,Africa
Nauru,12600,4.31,Africa
Nepal,2270,0.284,Asia
`
  },
  ProjectedMap: {
    config: {
      type: 'GenericMap',
      heightRatio: 0.5,
      points: true,
      pointLabel: 'name',
      pointAttributes: ['Land'],
      colorLegend: false,
      sizeRangeMax: 300,
      unit: 't CO<sub>2</sub> pro Kopf',
      features: {
        url: 'https://styleguide.republik.ch/static/geo/world-atlas-110m.json',
        object: 'land'
      }
    },
    values: `
      lon,lat,name,value,Land
      -81.6662,41.4609,"Cleveland",24.7086,"USA"
      126.6235,45.72794,"Harbin",5.8252,"China"
      114.4906,38.05647,"Shijiazhuang",7.409,"China"
      117.2686,31.84478,"Hefei",6.4152,"China"
      -1.97333,52.5129,"Birmingham",10.5696,"UK"
      76.8976,43.2746,"Almaty",13.8718,"Kazakhstan"
      125.2966,43.87748,"Changchun",7.5739,"China"
      -76.6564,39.3269,"Baltimore",20.2459,"USA"
      2.11335,41.4789,"Barcelona",7.1442,"Spain"
      106.6912,10.87065,"Ho Chi Minh City",2.2753,"Viet Nam"
      78.4717,17.4518,"Hyderabad",3.1619,"India"
      18.5775,-33.9625,"Cape Town",7.7099,"South Africa"
      4.41519,51.9588,"Rotterdam",11.0501,"Netherlands"
      -70.6611,-33.4681,"Santiago",4.3807,"Chile"
      117.0421,36.67991,"Jinan",8.5077,"China"
      -117.1063,32.7846,"San Diego",14.4791,"USA"
      -90.3813,38.6951,"St. Louis",24.0629,"USA"
      -73.6943,45.5521,"Montreal",10.136,"Canada"
`
  },
  SwissMap: {
    config: {
      type: 'SwissMap',
      legendTitle: 'Jastimmen',
      unit: 'Jastimmen',
      choropleth: true,
      numberFormat: '.0%',
      thresholdsLegend: [
        { label: 'Roses are red' },
        { minValue: 0.4, label: 'Gripens are blue' },
        { minValue: 0.5, label: 'I want seven of them' },
        { minValue: 0.6, label: 'And so do you' }
      ],
      colorRange: [
        'rgb(187,21,26)',
        'rgb(239,69,51)',
        'rgb(75,151,201)',
        'rgb(24,100,170)'
      ],
      features: {
        url:
          'https://styleguide.republik.ch/static/geo/ch-cantons-wo-lakes.json',
        object: 'cantons'
      },
      tooltipLabel: 'What about {name}?',
      tooltipBody:
        '{formattedValue} of people in {name} ({feature}) voted in favour of purchasing new military airplanes.\nBtw, did you know that they speak {language} in this canton?'
    },
    values: `
feature,value,language
ZH,0.487,German
BE,0.491,French and German
LU,0.543,German
UR,0.624,German
SZ,0.615,German
OW,0.638,German
NW,0.682,German
GL,0.599,German
ZG,0.6,German
FR,0.406,French and German
SO,0.503,German
BS,0.323,German
BL,0.425,German
SH,0.494,German
AR,0.511,German
AI,0.608,German
SG,0.5,German
GR,0.507,"German, Italian and Romansh"
AG,0.519,German
TG,0.556,German
TI,0.453,Italian
VD,0.349,French
VS,0.381,French and German
NE,0.309,French
GE,0.322,French
JU,0.257,French
`
  },
  Hemicycle: {
    config: {
      type: 'Hemicycle',
      unit: 'Sitze'
    },
    values: `
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
`
  }
}
