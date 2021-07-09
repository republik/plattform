export const chartTypes = [
  { label: 'Alle Charts', value: undefined },
  { label: 'Bar', value: 'Bar' },
  { label: 'Lollipop', value: 'Lollipop' },
  { label: 'Timebar', value: 'TimeBar' },
  { label: 'Line', value: 'Line' },
  { label: 'Slope', value: 'Slope' },
  { label: 'Scatter Plot', value: 'ScatterPlot' },
  { label: 'Weltkarte', value: 'GenericMap' },
  { label: 'Schweiz/Region', value: 'ProjectedMap' },
  { label: 'Hemicycle', value: 'Hemicycle' }
]

export const sizes = [
  { label: 'Normal', size: undefined },
  { label: 'Klein', size: 'narrow' },
  { label: 'Gross', size: 'breakout' },
  { label: 'Links', size: 'floatTiny' }
]

export const baseCharts = [
  {
    name: 'Bars',
    screenshot: '/static/charts/bars.png',
    config: {
      type: 'Bar',
      numberFormat: '.0%',
      y: 'country',
      color: 'highlight',
      showBarValues: true
    },
    values: `
country,value,highlight
Frankreich,0.455,0
Österreich,0.435,0
Italien,0.433,0
Deutschland,0.369,0
Schweiz,0.279,1
USA,0.264,0
Irland,0.236,0
`
  },
  {
    name: 'Bar Columns',
    screenshot: '/static/charts/multi-bars.png',
    config: {
      type: 'Bar',
      color: 'type',
      colorSort: 'none',
      numberFormat: '%',
      sort: 'none',
      column: 'type',
      y: 'category',
      columns: 3,
      minInnerWidth: 250
    },
    values: `
category,type,value
"Sprachen, Kultur, Politik",Nicht-berufsbezogene Weiterbildung,0.32
Pädagogik und Sozialkompetenz,Nicht-berufsbezogene Weiterbildung,0.07
"Sprachen, Kultur, Politik",Individuelle berufsbezogene Weiterbildung,0.15
Pädagogik und Sozialkompetenz,Individuelle berufsbezogene Weiterbildung,0.17
`
  },
  {
    name: 'Stacked Bars',
    screenshot: '/static/charts/filled-bars.png',
    config: {
      type: 'Bar',
      numberFormat: '%',
      color: 'concern',
      colorRange: 'diverging2',
      colorLegend: true,
      y: 'category',
      domain: [0, 1],
      sort: 'none',
      colorSort: 'none',
      highlight: "datum.category == 'Allgemein'"
    },
    values: `
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
`
  },
  {
    name: 'Lollipops',
    screenshot: '/static/charts/lollipops.png',
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
  {
    name: 'Timebars',
    screenshot: '/static/charts/timebars.png',
    config: {
      type: 'TimeBar',
      color: 'type',
      colorMap: {
        Überschuss: '#90AA00',
        Defizit: '#542785'
      },
      xTicks: [1990, 2000, 2010, 2016],
      yTicks: [10000000000, 5000000000, 0, -5000000000, -10000000000],
      numberFormat: '.3s'
    },
    values: `
year,value,type
1990,1057658360.08,Überschuss
1991,-2011523534.73,Defizit
1992,-2863480070.89,Defizit
1993,-7818499172.36,Defizit
1994,-5102405964.07,Defizit
1995,-3262732301.78,Defizit
1996,-3743144543.84,Defizit
1997,-5269452952.95,Defizit
1998,-857851361.56,Defizit
1999,-2351879865.72,Defizit
2000,3969594868.51,Überschuss
2001,-224765129.41,Defizit
2002,-2628735642.11,Defizit
2003,-2800591858.81,Defizit
2004,-1655861976.03,Defizit
2005,-121162004.28,Defizit
2006,2534297019.44,Überschuss
2007,4126837070.11,Überschuss
2008,7296651427.23,Überschuss
2009,2721390296.13,Überschuss
2010,3567528923.07,Überschuss
2011,1912378916.33,Überschuss
2012,1261617831.17,Überschuss
2013,1331670681.45,Überschuss
2014,-123948563.32,Defizit
2015,2337300888.72,Überschuss
2016,751559663.61,Überschuss
`
  },
  {
    name: 'Timebar Columns',
    screenshot: '/static/charts/multi-timebars.png',
    config: {
      type: 'TimeBar',
      unit: 'Überlebende',
      x: 'age',
      column: 'date',
      columns: 3,
      xScale: 'linear',
      padding: 10,
      numberFormat: '.0%',
      xTicks: [0, 100],
      xUnit: 'Alter'
    },
    values: `
age,date,value
0,1851,1
20,1851,0.659
40,1851,0.54
60,1851,0.376
80,1851,0.089
100,1851,0
0,1931,1
20,1931,0.875
40,1931,0.812
60,1931,0.652
80,1931,0.193
100,1931,0
`
  },
  {
    name: 'Stacked Timebars',
    screenshot: '/static/charts/stacked-timebars.png',
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
  {
    name: 'Histogram (Ordinal)',
    screenshot: '/static/charts/ordinal-timebars.png',
    config: {
      type: 'TimeBar',
      x: 'category',
      color: 'year',
      colorRange: ['#004529'],
      xScale: 'ordinal',
      unit: 'der landwirtschaftlichen Betriebe',
      numberFormat: '.1%',
      padding: 10,
      xTicks: ['1–3', '5–10', '20–30', '> 50']
    },
    values: `
year,category,value
2018,< 1,0.041748603791395
2018,1–3,0.06330134507984
2018,3–5,0.049535908125541
2018,5–10,0.132777471879179
2018,10–20,0.292476205458979
2018,20–30,0.207976087469519
2018,30–50,0.156218044521356
2018,> 50,0.055966333674192
`
  },
  {
    name: 'Lines',
    screenshot: '/static/charts/lines.png',
    config: {
      type: 'Line',
      unit: 'Jahre',
      numberFormat: '.1f',
      zero: false,
      colorRange: ['#C40046', '#F2BF18', '#F28502'],
      color: 'gender'
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
  {
    name: 'Stroked Line',
    screenshot: '/static/charts/lines-stroke.png',
    config: {
      type: 'Line',
      height: 240,
      sort: 'none',
      color: 'type',
      colorSort: 'none',
      unit: 'Personen',
      numberFormat: 's',
      x: 'date',
      timeParse: '%Y-%m-%d',
      timeFormat: '%d.%m.',
      colorMap: {
        'positiv Getestete': 'rgba(31, 119, 180, 1)',
        'bereits Infizierte': 'rgba(127,191,123, 0.9)'
      },
      labelFilter: 'false',
      colorLegend: true,
      stroke: 'datum.type !== "positiv Getestete"',
      yNice: 0,
      yTicks: [0, 2500, 5000, 7500, 10000, 12500],
      xTicks: ['2020-03-01', '2020-03-16', '2020-03-26'],
      paddingTop: 8,
      xAnnotations: [
        {
          x1: '2020-03-16',
          x2: '2020-03-26',
          value: 13801,
          unit: ' Personen',
          label: 'bereits vor 10 Tagen infiziert',
          showValue: false
        }
      ]
    },
    values: `
type,date,value
positiv Getestete,2020-03-01,70
positiv Getestete,2020-03-02,102
positiv Getestete,2020-03-03,135
positiv Getestete,2020-03-04,195
positiv Getestete,2020-03-05,254
positiv Getestete,2020-03-06,327
positiv Getestete,2020-03-07,376
positiv Getestete,2020-03-08,438
positiv Getestete,2020-03-09,623
positiv Getestete,2020-03-10,823
positiv Getestete,2020-03-11,1135
positiv Getestete,2020-03-12,1461
positiv Getestete,2020-03-13,1873
positiv Getestete,2020-03-14,2294
positiv Getestete,2020-03-15,2611
positiv Getestete,2020-03-16,3611
positiv Getestete,2020-03-17,4583
positiv Getestete,2020-03-18,5734
positiv Getestete,2020-03-19,6572
positiv Getestete,2020-03-20,7716
positiv Getestete,2020-03-21,8413
positiv Getestete,2020-03-22,8948
positiv Getestete,2020-03-23,10416
positiv Getestete,2020-03-24,11664
positiv Getestete,2020-03-25,12726
positiv Getestete,2020-03-26,13801
bereits Infizierte,2020-03-01,1135
bereits Infizierte,2020-03-02,1461
bereits Infizierte,2020-03-03,1873
bereits Infizierte,2020-03-04,2294
bereits Infizierte,2020-03-05,2611
bereits Infizierte,2020-03-06,3611
bereits Infizierte,2020-03-07,4583
bereits Infizierte,2020-03-08,5734
bereits Infizierte,2020-03-09,6572
bereits Infizierte,2020-03-10,7716
bereits Infizierte,2020-03-11,8413
bereits Infizierte,2020-03-12,8948
bereits Infizierte,2020-03-13,10416
bereits Infizierte,2020-03-14,11664
bereits Infizierte,2020-03-15,12726
bereits Infizierte,2020-03-16,13801
    `
  },
  {
    name: 'Confidence Bands',
    screenshot: '/static/charts/bands.png',
    config: {
      numberFormat: '.2f',
      color: 'category',
      band: 'confidence95',
      bandLegend: '95-Prozent-Konfidenzintervall',
      type: 'Line'
    },
    values: `
category,year,value,confidence95_lower,confidence95_upper
Oberste Einkommen,1991,7.70388503,7.55473859,7.85303157
Oberste Einkommen,1992,7.31237031,7.14783672,7.47690388
Oberste Einkommen,1993,7.05771049,6.89426273,7.22115857
Oberste Einkommen,1994,7.26254451,7.13745479,7.38763448
Oberste Einkommen,1995,7.12396028,6.79629487,7.45162612
Oberste Einkommen,1996,7.20730586,7.03792944,7.37668237
Oberste Einkommen,1997,7.35054646,7.09085513,7.61023759
Oberste Einkommen,1998,7.31048811,7.18978234,7.43119410
Oberste Einkommen,1999,7.31499167,7.09225644,7.53772651
Oberste Einkommen,2000,7.43113140,7.37079312,7.49146961
Oberste Einkommen,2001,7.21670608,7.09378583,7.33962672
Oberste Einkommen,2002,7.25964278,7.12030801,7.39897719
Oberste Einkommen,2003,7.17693254,7.02270067,7.33116400
Oberste Einkommen,2004,7.01958149,6.86757144,7.17159120
Oberste Einkommen,2005,6.97619338,6.81720873,7.13517813
Oberste Einkommen,2006,7.11799206,7.00116320,7.23482064
Oberste Einkommen,2007,7.11373370,6.91485941,7.31260812
Oberste Einkommen,2008,7.23273389,7.07946258,7.38600487
Oberste Einkommen,2009,7.04101494,6.90843652,7.17359378
Oberste Einkommen,2010,7.24250971,7.08551859,7.39950110
Oberste Einkommen,2011,7.18729546,7.09688701,7.27770386
Oberste Einkommen,2012,7.24192507,7.03733352,7.44651696
Oberste Einkommen,2013,7.30490000,7.18216251,7.42763783
Oberste Einkommen,2014,7.37813382,7.23891745,7.51735010
Unterste Einkommen,1991,6.59219716,5.97275408,7.21163981
Unterste Einkommen,1992,6.44213742,6.01034235,6.87393213
Unterste Einkommen,1993,6.70573324,6.34278379,7.06868281
Unterste Einkommen,1994,6.16818299,5.64157807,6.69478763
Unterste Einkommen,1995,6.02004351,5.69419482,6.34589193
Unterste Einkommen,1996,6.07633580,5.70647180,6.44620002
Unterste Einkommen,1997,5.80750421,5.60348859,6.01151976
Unterste Einkommen,1998,6.40939891,5.96369471,6.85510336
Unterste Einkommen,1999,6.37915153,5.78367563,6.97462706
Unterste Einkommen,2000,6.52467965,6.23936947,6.80998986
Unterste Einkommen,2001,6.39326613,6.01490468,6.77162772
Unterste Einkommen,2002,6.46966442,6.10404591,6.83528324
Unterste Einkommen,2003,5.86378442,5.47713885,6.25042978
Unterste Einkommen,2004,5.42127334,5.08393568,5.75861078
Unterste Einkommen,2005,5.93505081,5.37149613,6.49860579
Unterste Einkommen,2006,6.09851513,5.90034267,6.29668740
Unterste Einkommen,2007,5.93678717,5.52273282,6.35084143
Unterste Einkommen,2008,6.31126331,5.80801400,6.81451217
Unterste Einkommen,2009,6.27139018,5.88651339,6.65626654
Unterste Einkommen,2010,6.31624841,5.98233719,6.65015965
Unterste Einkommen,2011,6.47754732,6.23046817,6.72462617
Unterste Einkommen,2012,6.53496432,6.10142285,6.96850532
Unterste Einkommen,2013,6.59633765,6.23829044,6.95438515
Unterste Einkommen,2014,6.85379000,6.69934954,7.00823007
Gesamt,1991,7.27869,7.20332,7.35407
Gesamt,1992,7.06308,6.99279,7.13337
Gesamt,1993,6.96109,6.93000,6.99218
Gesamt,1994,6.86758,6.77587,6.95928
Gesamt,1995,6.83180,6.75502,6.90858
Gesamt,1996,6.81936,6.75502,6.90858
Gesamt,1997,6.81966,6.74775,6.89157
Gesamt,1998,6.87913,6.80111,6.95715
Gesamt,1999,6.91494,6.82023,7.00965
Gesamt,2000,7.10757,7.05554,7.15961
Gesamt,2001,6.90476,6.85910,6.95043
Gesamt,2002,6.88928,6.84473,6.93383
Gesamt,2003,6.76875,6.72208,6.81542
Gesamt,2004,6.74274,6.72208,6.81542
Gesamt,2005,6.71687,6.63086,6.80287
Gesamt,2006,6.79813,6.75289,6.84336
Gesamt,2007,6.77577,6.70156,6.84999
Gesamt,2008,6.74164,6.66124,6.82203
Gesamt,2009,6.81263,6.71438,6.91088
Gesamt,2010,6.90226,6.83339,6.97112
Gesamt,2011,7.01994,6.97718,7.06270
Gesamt,2012,7.00601,6.94204,7.06998
Gesamt,2013,7.05254,7.00163,7.10346
Gesamt,2014,7.13645,7.11445,7.15846
`
  },
  {
    name: 'Slopes',
    screenshot: '/static/charts/slopes.png',
    config: {
      color: 'country',
      colorSort: 'none',
      colorLegend: false,
      colorRange: ['#d62728', '#ff7f0e'],
      column: 'country',
      columns: 2,
      columnSort: 'none',
      numberFormat: '.0%',
      type: 'Slope'
    },
    values: `
year,country,value
1870,Österreich,0.689443115818244
1870,Deutschland,0.806969593440383
2016,Österreich,0.727798978073863
2016,Deutschland,0.75740573054783
`
  },
  {
    name: 'Scatter Plot',
    large: true,
    screenshot: '/static/charts/scatter-plot.png',
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
Afghanistan,1780,0.299,Asia
Albania,10700,1.96,Europe
Algeria,13500,3.72,Africa
Andorra,44900,5.83,Africa
Angola,6260,1.29,Africa
Antigua and Barbuda,19500,5.38,Africa
Argentina,18800,4.75,Americas
Armenia,7970,1.9,FSU
Australia,43400,15.4,Oceania
Austria,44100,6.8,Europe
Azerbaijan,16700,3.94,Asia
Bahamas,22300,6.32,Americas
Bahrain,44400,23.4,Asia
Bangladesh,2970,0.459,Asia
Barbados,15300,4.49,Americas
Belarus,17900,6.69,FSU
Belgium,41400,8.32,Europe
Belize,8050,1.41,Americas
Benin,2000,0.614,Africa
Bhutan,7370,1.29,Asia
Bolivia,6330,1.93,Americas
Bosnia and Herzegovina,10500,6.23,Europe
Botswana,15900,3.24,Africa
Brazil,15400,2.59,Americas
Brunei,76100,22.1,Asia
Bulgaria,16300,5.87,Europe
Burkina Faso,1540,0.162,Africa
Burundi,803,0.0445,Africa
Cambodia,3120,0.438,Asia
Cameroon,2900,0.315,Africa
Canada,42900,15.1,Americas
Cape Verde,5930,0.933,Africa
Central African Republic,602,0.0666,Africa
Chad,2080,0.0538,Africa
Chile,22200,4.69,Americas
China,12800,7.4,Asia
Colombia,12700,1.76,Americas
Comoros,1430,0.203,Africa
"Congo, Dem. Rep.",726,0.0634,Africa
"Congo, Rep.",5540,0.635,Africa
Costa Rica,14400,1.63,Americas
Cote d'Ivoire,3060,0.49,Africa
Croatia,20100,3.96,Europe
Cuba,20000,3.05,Americas
Cyprus,29700,5.26,Europe
Czech Republic,29100,9.1,Europe
Denmark,45100,5.91,Europe
Djibouti,3000,0.792,Africa
Dominica,10400,1.86,Africa
Dominican Republic,12600,2.07,Americas
Ecuador,10900,2.76,Americas
Egypt,9880,2.2,Africa
El Salvador,7710,1,Americas
Equatorial Guinea,31200,4.73,Africa
Eritrea,1200,0.147,Africa
Estonia,27000,14.8,Europe
Ethiopia,1430,0.119,Africa
Fiji,8350,1.32,Oceania
Finland,39000,8.66,Europe
France,37500,4.72,Europe
Gabon,16700,2.77,Africa
Gambia,1560,0.268,Africa
Georgia,8750,2.25,FSU
Germany,43400,8.83,Europe
Ghana,3870,0.537,Africa
Greece,24000,5.98,Europe
Grenada,12000,2.28,Americas
Guatemala,7150,1.15,Americas
Guinea,1210,0.207,Africa
Guinea-Bissau,1390,0.157,Africa
Guyana,6890,2.63,Americas
Haiti,1650,0.271,Americas
Honduras,4230,1.08,Americas
Hungary,24000,4.29,Europe
Iceland,41400,6.04,Europe
India,5390,1.73,Asia
Indonesia,10000,1.82,Asia
Iran,16500,8.28,Asia
Iraq,14700,4.81,Asia
Ireland,48900,7.27,Europe
Israel,31800,8.13,Asia
Italy,33900,5.38,Europe
Jamaica,8050,2.59,Americas
Japan,37300,9.47,Asia
Jordan,8620,3,Asia
Kazakhstan,23600,14.2,FSU
Kenya,2750,0.31,Africa
Kiribati,1840,0.564,Africa
Kuwait,70800,25.2,Asia
Kyrgyz Republic,3180,1.66,Asia
Lao,5130,0.297,Asia
Latvia,22300,3.46,FSU
Lebanon,13500,4.3,Asia
Lesotho,2660,1.15,Africa
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
Netherlands,45700,9.91,Europe
New Zealand,34500,7.59,Oceania
Nicaragua,4790,0.809,Americas
Niger,900,0.111,Africa
Nigeria,5670,0.546,Africa
North Korea,1390,1.61,Asia
Norway,63300,9.27,Europe
Oman,40300,15.4,Asia
Pakistan,4580,0.896,Asia
Palau,13300,12.3,Asia
Palestine,2640,0.626,Asia
Panama,19900,2.25,Americas
Papua New Guinea,2620,0.815,Oceania
Paraguay,8500,0.87,Americas
Peru,11500,1.99,Americas
Philippines,6590,1.06,Asia
Poland,24300,7.46,Europe
Portugal,26000,4.3,Europe
Qatar,121000,45.4,Asia
Romania,19700,3.5,Europe
Russia,24900,11.9,FSU
Rwanda,1620,0.074,Africa
Samoa,5510,1.03,Oceania
San Marino,39100,1.03,Oceania
Sao Tome and Principe,2890,0.594,Africa
Saudi Arabia,50000,19.5,Asia
Senegal,2220,0.609,Africa
Serbia,13100,4.24,Europe
Seychelles,25200,5.31,Europe
Sierra Leone,1690,0.185,Africa
Singapore,80300,10.3,Asia
Slovak Republic,27200,5.65,Europe
Slovenia,28500,6.19,Europe
Solomon Islands,2020,0.35,Oceania
Somalia,621,0.045,Africa
South Africa,12500,8.98,Africa
South Korea,33400,11.7,Asia
South Sudan,1990,0.13,Africa
Spain,31200,5.03,Europe
Sri Lanka,10700,0.892,Asia
St. Kitts and Nevis,23500,4.3,Asia
St. Lucia,10500,2.31,Asia
St. Vincent and the Grenadines,10300,1.91,Asia
Sudan,4190,0.407,Africa
Suriname,15300,3.63,Americas
Swaziland,8080,0.929,Africa
Sweden,44200,4.48,Europe
Switzerland,56700,4.29,Europe
Syria,4300,1.6,Asia
Tajikistan,2550,0.62,Asia
Tanzania,2400,0.221,Africa
Thailand,14900,4.62,Asia
Timor-Leste,2110,0.387,Asia
Togo,1320,0.363,Africa
Tonga,5030,1.14,Oceania
Trinidad and Tobago,31600,34.2,Americas
Tunisia,10800,2.59,Africa
Turkey,22400,4.49,Europe
Turkmenistan,14300,12.5,Asia
Tuvalu,3270,1.01,Asia
Uganda,1670,0.135,Africa
Ukraine,8240,5.06,FSU
United Arab Emirates,64100,23.3,Asia
United Kingdom,38000,6.46,Europe
United States,51800,16.5,Americas
Uruguay,19800,1.97,Americas
Uzbekistan,5370,3.45,FSU
Vanuatu,2890,0.595,Oceania
Venezuela,16700,6.03,Americas
Vietnam,5370,1.8,Asia
Yemen,3770,0.865,Asia
Zambia,3630,0.288,Africa
Zimbabwe,1910,0.78,Africa
`
  },
  {
    name: 'World Choropleth',
    large: true,
    screenshot: '/static/charts/world-map.png',
    config: {
      type: 'GenericMap',
      colorLegend: true,
      heightRatio: 0.469,
      choropleth: true,
      opacity: 1,
      thresholds: [30, 40, 50, 60, 70, 80, 90],
      colorRange: [
        '#800026',
        '#bd0026',
        '#e31a1c',
        '#fc4e2a',
        '#fd8d3c',
        '#feb24c',
        '#fed976',
        '#ffeda0'
      ],
      features: {
        url:
          'https://cdn.repub.ch/s3/republik-assets/assets/geo/world-atlas-110m-without-antarctic.json',
        object: 'countries'
      },
      missingDataLegend: 'Nicht untersucht',
      label: 'label',
      legendTitle: 'Medienfreiheit',
      colorLegendPosition: 'left',
      colorLegendSize: 0.17,
      colorLegendMinWidth: 90
    },
    values: `
feature,value
004,62.3
024,66.08
008,69.75
784,57.31
032,71.22
051,71.4
036,79.79
040,84.22
031,41.52
108,44.67
056,87.43
204,64.89
854,76.53
050,50.63
100,64.94
070,71.49
112,50.25
084,72.5
068,64.63
076,65.95
096,50.35
064,71.1
072,76.44
140,57.13
124,84.71
756,89.38
152,72.69
156,21.52
384,71.06
120,56.72
180,50.91
178,63.44
170,57.34
188,89.47
192,36.19
196,79.55
203,76.43
276,87.84
262,23.27
208,91.87
214,72.1
012,54.48
218,67.38
818,43.18
232,16.5
724,77.84
233,87.39
231,67.18
246,92.07
242,72.59
250,77.08
266,62.8
826,77.07
268,71.41
288,77.74
324,65.66
270,69.38
624,67.94
226,43.62
300,71.2
320,64.26
328,73.37
340,51.8
191,71.49
332,69.8
348,69.16
360,63.18
356,54.67
372,87.4
364,35.19
368,44.63
352,84.88
376,69.16
380,76.31
388,89.49
400,57.92
392,71.14
398,45.89
404,66.28
417,69.81
116,54.54
410,76.3
414,65.7
418,35.72
422,66.81
430,67.75
434,44.23
144,58.06
426,69.55
440,78.81
442,84.54
428,81.44
504,57.12
498,68.84
450,72.32
484,54.55
807,68.72
466,65.88
104,55.23
499,66.17
496,70.39
508,66.21
478,67.46
454,70.68
458,66.88
516,80.75
562,71.75
566,64.37
558,64.19
528,90.04
578,92.16
524,64.9
554,89.31
512,56.58
586,54.48
591,70.22
604,69.06
608,56.46
598,76.07
616,71.35
408,14.18
620,88.17
600,67.03
634,57.49
642,74.09
643,51.08
646,49.66
682,37.86
729,44.67
686,76.01
694,69.72
222,70.3
706,44.55
688,68.38
728,55.51
740,82.5
703,77.33
705,77.36
752,90.75
748,54.85
760,27.43
148,60.3
768,70.67
764,55.06
762,44.66
795,14.56
626,70.1
780,76.78
788,70.55
792,49.98
158,76.24
834,59.75
800,59.05
804,67.48
858,84.21
840,76.15
860,46.93
862,54.34
704,25.29
887,41.75
710,77.59
894,63
716,59.05
KOS,70.67
CYN,70.21
`
  },
  {
    name: 'Canton Choropleth',
    screenshot: '/static/charts/swiss-map.png',
    config: {
      type: 'ProjectedMap',
      heightRatio: 0.63,
      legendTitle: 'Jastimmen',
      unit: 'Jastimmen',
      choropleth: true,
      numberFormat: '.0%',
      thresholds: [0.4, 0.5, 0.6],
      colorRange: [
        'rgb(187,21,26)',
        'rgb(239,69,51)',
        'rgb(75,151,201)',
        'rgb(24,100,170)'
      ],
      features: {
        url:
          'https://cdn.repub.ch/s3/republik-assets/assets/geo/epsg2056-projected-ch-cantons-wo-lakes.json',
        object: 'cantons'
      }
    },
    values: `
feature,value
ZH,0.487
BE,0.491
LU,0.543
UR,0.624
SZ,0.615
OW,0.638
NW,0.682
GL,0.599
ZG,0.6
FR,0.406
SO,0.503
BS,0.323
BL,0.425
SH,0.494
AR,0.511
AI,0.608
SG,0.5
GR,0.507
AG,0.519
TG,0.556
TI,0.453
VD,0.349
VS,0.381
NE,0.309
GE,0.322
JU,0.257
`
  },
  {
    name: 'Hemicycle',
    screenshot: '/static/charts/hemicycle.png',
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
]
