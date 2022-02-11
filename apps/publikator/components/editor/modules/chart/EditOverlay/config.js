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
  { label: 'Hemicycle', value: 'Hemicycle' },
]

export const sizes = [
  { label: 'Normal', size: undefined },
  { label: 'Klein', size: 'narrow' },
  { label: 'Gross', size: 'breakout' },
  { label: 'Links', size: 'floatTiny' },
]

export const baseCharts = [
  {
    name: 'Linien',
    screenshot: '/static/charts/basic-line.png',
    config: {
      type: 'Line',
      x: 'date',
      timeParse: '%Y-%m-%d',
      y: 'value',
      unit: 'Personen',
      numberFormat: 's',
      xTicks: ['2020-02-26', '2020-04-01', '2020-05-01'],
      timeFormat: '%d.%m.',
      colorRange: ['rgb(24,100,170)'],
      endValue: false,
      endLabel: false,
    },
    values: `
location,date,value
Switzerland,2020-02-26,1
Switzerland,2020-02-27,1
Switzerland,2020-02-28,8
Switzerland,2020-02-29,12
Switzerland,2020-03-01,18
Switzerland,2020-03-02,24
Switzerland,2020-03-03,30
Switzerland,2020-03-04,37
Switzerland,2020-03-05,57
Switzerland,2020-03-06,87
Switzerland,2020-03-07,209
Switzerland,2020-03-08,264
Switzerland,2020-03-09,332
Switzerland,2020-03-10,374
Switzerland,2020-03-11,490
Switzerland,2020-03-12,642
Switzerland,2020-03-13,854
Switzerland,2020-03-14,1121
Switzerland,2020-03-15,1359
Switzerland,2020-03-16,2200
Switzerland,2020-03-17,2200
Switzerland,2020-03-18,2650
Switzerland,2020-03-19,3010
Switzerland,2020-03-20,3888
Switzerland,2020-03-21,4840
Switzerland,2020-03-22,6077
Switzerland,2020-03-23,6971
Switzerland,2020-03-24,8015
Switzerland,2020-03-25,8789
Switzerland,2020-03-26,9714
Switzerland,2020-03-27,10714
Switzerland,2020-03-28,12104
Switzerland,2020-03-29,13152
Switzerland,2020-03-30,14274
Switzerland,2020-03-31,15412
Switzerland,2020-04-01,16108
Switzerland,2020-04-02,17070
Switzerland,2020-04-03,18194
Switzerland,2020-04-04,19227
Switzerland,2020-04-05,20201
Switzerland,2020-04-06,21022
Switzerland,2020-04-07,21574
Switzerland,2020-04-08,22164
Switzerland,2020-04-09,22710
Switzerland,2020-04-10,23495
Switzerland,2020-04-11,24228
Switzerland,2020-04-12,24820
Switzerland,2020-04-13,25220
Switzerland,2020-04-14,25499
Switzerland,2020-04-15,25753
Switzerland,2020-04-16,26336
Switzerland,2020-04-17,26651
Switzerland,2020-04-18,26997
Switzerland,2020-04-19,27322
Switzerland,2020-04-20,27658
Switzerland,2020-04-21,27826
Switzerland,2020-04-22,27981
Switzerland,2020-04-23,28186
Switzerland,2020-04-24,28414
Switzerland,2020-04-25,28595
Switzerland,2020-04-26,28811
Switzerland,2020-04-27,28978
Switzerland,2020-04-28,29081
Switzerland,2020-04-29,29181
Switzerland,2020-04-30,29324
Switzerland,2020-05-01,29503
`,
  },
  {
    name: 'Balken',
    screenshot: '/static/charts/bars.png',
    config: {
      type: 'Bar',
      numberFormat: '.0%',
      y: 'country',
      color: 'highlight',
      showBarValues: true,
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
`,
  },
  {
    name: 'Säulen (zeitlich)',
    screenshot: '/static/charts/timebars-basic.png',
    config: {
      type: 'TimeBar',
      x: 'Datum',
      unit: 'Personen',
      timeParse: '%Y-%m-%d',
      timeFormat: '%d.%m.',
      xTicks: ['2020-08-01', '2020-09-01'],
      y: 'value',
    },
    values: `
Datum,value
2020-08-01,96
2020-08-02,80
2020-08-03,196
2020-08-04,181
2020-08-05,152
2020-08-06,156
2020-08-07,183
2020-08-08,130
2020-08-09,99
2020-08-10,281
2020-08-11,255
2020-08-12,247
2020-08-13,273
2020-08-14,234
2020-08-15,149
2020-08-16,141
2020-08-17,286
2020-08-18,296
2020-08-19,283
2020-08-20,350
2020-08-21,314
2020-08-22,192
2020-08-23,136
2020-08-24,306
2020-08-25,338
2020-08-26,361
2020-08-27,352
2020-08-28,374
2020-08-29,214
2020-08-30,144
2020-08-31,346
2020-09-01,364
2020-09-02,415
2020-09-03,436
2020-09-04,424
2020-09-05,293
2020-09-06,170
2020-09-07,466
2020-09-08,387
2020-09-09,460
2020-09-10,506
2020-09-11,530
2020-09-12,266
2020-09-13,236
2020-09-14,500
2020-09-15,457
2020-09-16,495
`,
  },
  {
    name: 'Säulen (ordinal)',
    screenshot: '/static/charts/timebars-ordinal.png',
    config: {
      type: 'TimeBar',
      x: 'length',
      xScale: 'ordinal',
      unit: 'Wörter',
      numberFormat: '.1f',
      padding: 10,
      xTicks: [2, 5, 10, 15, 20, 25, 30],
      colorRange: ['#FF5768'],
      domain: [0, 8500],
      yTicks: [0, 4000, 8000],
      xUnit: 'Buchstaben pro Wort',
    },
    values: `
length,value
1,0
2,2210
3,8191
4,4797
5,3747
6,3464
7,2279
8,1785
9,1673
10,1388
11,937
12,576
13,378
14,355
15,249
16,147
17,138
18,113
19,36
20,55
21,25
22,13
23,20
24,9
25,1
26,3
27,2
28,0
29,0
30,0
31,1
`,
  },
  {
    name: 'Linien, mehrere',
    screenshot: '/static/charts/multi-lines.png',
    config: {
      type: 'Line',
      x: 'date',
      timeParse: '%Y-%m-%d',
      numberFormat: 's',
      color: 'company',
      column: 'company',
      columns: 2,
      yNice: 0,
      yTicks: [0, 100, 200, 300],
      xTicks: ['2010-01-04', '2020-01-31'],
      endLabel: false,
      colorMap: {
        'Northrop Grumman': '#d62728',
        'Lockheed Martin': '#ff7f0e',
      },
    },
    values: `
company,date,value
Northrop Grumman,2010-01-04,100.0
Northrop Grumman,2010-01-31,104.9
Northrop Grumman,2010-02-28,110.9
Northrop Grumman,2010-03-31,112.0
Northrop Grumman,2010-04-30,114.0
Northrop Grumman,2010-05-31,111.4
Northrop Grumman,2010-06-30,105.8
Northrop Grumman,2010-07-31,106.5
Northrop Grumman,2010-08-31,103.8
Northrop Grumman,2010-09-30,106.8
Northrop Grumman,2010-10-31,107.2
Northrop Grumman,2010-11-30,105.4
Northrop Grumman,2010-12-31,103.8
Northrop Grumman,2011-01-31,108.4
Northrop Grumman,2011-02-28,101.6
Northrop Grumman,2011-03-31,105.3
Northrop Grumman,2011-04-30,103.7
Northrop Grumman,2011-05-31,108.5
Northrop Grumman,2011-06-30,117.2
Northrop Grumman,2011-07-31,104.4
Northrop Grumman,2011-08-31,100.6
Northrop Grumman,2011-09-30,103.4
Northrop Grumman,2011-10-31,103.2
Northrop Grumman,2011-11-30,103.1
Northrop Grumman,2011-12-31,104.6
Northrop Grumman,2012-01-31,99.4
Northrop Grumman,2012-02-29,99.0
Northrop Grumman,2012-03-31,97.9
Northrop Grumman,2012-04-30,102.0
Northrop Grumman,2012-05-31,101.7
Northrop Grumman,2012-06-30,106.1
Northrop Grumman,2012-07-31,108.6
Northrop Grumman,2012-08-31,108.2
Northrop Grumman,2012-09-30,104.7
Northrop Grumman,2012-10-31,110.3
Northrop Grumman,2012-11-30,107.4
Northrop Grumman,2012-12-31,107.9
Northrop Grumman,2013-01-31,98.7
Northrop Grumman,2013-02-28,99.2
Northrop Grumman,2013-03-31,102.1
Northrop Grumman,2013-04-30,108.1
Northrop Grumman,2013-05-31,115.8
Northrop Grumman,2013-06-30,118.0
Northrop Grumman,2013-07-31,124.8
Northrop Grumman,2013-08-31,129.7
Northrop Grumman,2013-09-30,129.8
Northrop Grumman,2013-10-31,140.1
Northrop Grumman,2013-11-30,143.2
Northrop Grumman,2013-12-31,142.1
Northrop Grumman,2014-01-31,148.4
Northrop Grumman,2014-02-28,149.4
Northrop Grumman,2014-03-31,151.0
Northrop Grumman,2014-04-30,147.6
Northrop Grumman,2014-05-31,145.1
Northrop Grumman,2014-06-30,139.9
Northrop Grumman,2014-07-31,146.2
Northrop Grumman,2014-08-31,145.9
Northrop Grumman,2014-09-30,153.3
Northrop Grumman,2014-10-31,156.6
Northrop Grumman,2014-11-30,156.6
Northrop Grumman,2014-12-31,164.2
Northrop Grumman,2015-01-31,180.3
Northrop Grumman,2015-02-28,180.7
Northrop Grumman,2015-03-31,178.4
Northrop Grumman,2015-04-30,169.1
Northrop Grumman,2015-05-31,173.4
Northrop Grumman,2015-06-30,176.2
Northrop Grumman,2015-07-31,188.2
Northrop Grumman,2015-08-31,190.5
Northrop Grumman,2015-09-30,197.9
Northrop Grumman,2015-10-31,206.5
Northrop Grumman,2015-11-30,205.2
Northrop Grumman,2015-12-31,211.3
Northrop Grumman,2016-01-31,217.9
Northrop Grumman,2016-02-29,227.6
Northrop Grumman,2016-03-31,219.4
Northrop Grumman,2016-04-30,227.8
Northrop Grumman,2016-05-31,230.8
Northrop Grumman,2016-06-30,241.6
Northrop Grumman,2016-07-31,227.1
Northrop Grumman,2016-08-31,222.9
Northrop Grumman,2016-09-30,224.8
Northrop Grumman,2016-10-31,245.1
Northrop Grumman,2016-11-30,257.7
Northrop Grumman,2016-12-31,236.3
Northrop Grumman,2017-01-31,228.4
Northrop Grumman,2017-02-28,236.9
Northrop Grumman,2017-03-31,228.6
Northrop Grumman,2017-04-30,234.1
Northrop Grumman,2017-05-31,243.2
Northrop Grumman,2017-06-30,240.3
Northrop Grumman,2017-07-31,241.4
Northrop Grumman,2017-08-31,249.9
Northrop Grumman,2017-09-30,258.8
Northrop Grumman,2017-10-31,259.7
Northrop Grumman,2017-11-30,262.1
Northrop Grumman,2017-12-31,259.7
Northrop Grumman,2018-01-31,272.6
Northrop Grumman,2018-02-28,290.9
Northrop Grumman,2018-03-31,298.6
Northrop Grumman,2018-04-30,274.4
Northrop Grumman,2018-05-31,272.3
Northrop Grumman,2018-06-30,255.4
Northrop Grumman,2018-07-31,240.5
Northrop Grumman,2018-08-31,232.3
Northrop Grumman,2018-09-30,245.6
Northrop Grumman,2018-10-31,217.5
Northrop Grumman,2018-11-30,212.5
Northrop Grumman,2018-12-31,220.1
Northrop Grumman,2019-01-31,229.3
Northrop Grumman,2019-02-28,234.8
Northrop Grumman,2019-03-31,214.1
Northrop Grumman,2019-04-30,221.3
Northrop Grumman,2019-05-31,248.3
Northrop Grumman,2019-06-30,247.1
Northrop Grumman,2019-07-31,260.5
Northrop Grumman,2019-08-31,281.8
Northrop Grumman,2019-09-30,282.8
Northrop Grumman,2019-10-31,260.4
Northrop Grumman,2019-11-30,251.7
Northrop Grumman,2019-12-31,238.9
Northrop Grumman,2020-01-31,260.3
Northrop Grumman,2020-02-29,249.9
Northrop Grumman,2020-03-31,262.3
Northrop Grumman,2020-04-30,254.1
Northrop Grumman,2020-05-31,247.0
Northrop Grumman,2020-06-30,222.1
Northrop Grumman,2020-07-31,222.2
Northrop Grumman,2020-08-31,219.5
Northrop Grumman,2020-09-30,210.1
Lockheed Martin,2010-01-04,100.0
Lockheed Martin,2010-01-31,102.2
Lockheed Martin,2010-02-28,104.3
Lockheed Martin,2010-03-31,105.3
Lockheed Martin,2010-04-30,105.7
Lockheed Martin,2010-05-31,109.0
Lockheed Martin,2010-06-30,107.2
Lockheed Martin,2010-07-31,101.1
Lockheed Martin,2010-08-31,98.8
Lockheed Martin,2010-09-30,93.0
Lockheed Martin,2010-10-31,89.6
Lockheed Martin,2010-11-30,86.5
Lockheed Martin,2010-12-31,83.3
Lockheed Martin,2011-01-31,92.6
Lockheed Martin,2011-02-28,89.9
Lockheed Martin,2011-03-31,91.3
Lockheed Martin,2011-04-30,87.4
Lockheed Martin,2011-05-31,87.7
Lockheed Martin,2011-06-30,92.7
Lockheed Martin,2011-07-31,88.5
Lockheed Martin,2011-08-31,92.6
Lockheed Martin,2011-09-30,97.5
Lockheed Martin,2011-10-31,91.9
Lockheed Martin,2011-11-30,96.0
Lockheed Martin,2011-12-31,98.4
Lockheed Martin,2012-01-31,95.9
Lockheed Martin,2012-02-29,99.8
Lockheed Martin,2012-03-31,98.2
Lockheed Martin,2012-04-30,99.6
Lockheed Martin,2012-05-31,98.0
Lockheed Martin,2012-06-30,99.0
Lockheed Martin,2012-07-31,100.1
Lockheed Martin,2012-08-31,101.1
Lockheed Martin,2012-09-30,101.0
Lockheed Martin,2012-10-31,103.2
Lockheed Martin,2012-11-30,103.4
Lockheed Martin,2012-12-31,101.4
Lockheed Martin,2013-01-31,90.7
Lockheed Martin,2013-02-28,91.9
Lockheed Martin,2013-03-31,97.1
Lockheed Martin,2013-04-30,97.8
Lockheed Martin,2013-05-31,103.2
Lockheed Martin,2013-06-30,107.2
Lockheed Martin,2013-07-31,113.0
Lockheed Martin,2013-08-31,119.7
Lockheed Martin,2013-09-30,120.9
Lockheed Martin,2013-10-31,120.8
Lockheed Martin,2013-11-30,125.7
Lockheed Martin,2013-12-31,128.7
Lockheed Martin,2014-01-31,135.3
Lockheed Martin,2014-02-28,140.3
Lockheed Martin,2014-03-31,140.0
Lockheed Martin,2014-04-30,139.7
Lockheed Martin,2014-05-31,137.2
Lockheed Martin,2014-06-30,132.0
Lockheed Martin,2014-07-31,139.1
Lockheed Martin,2014-08-31,140.4
Lockheed Martin,2014-09-30,149.6
Lockheed Martin,2014-10-31,152.2
Lockheed Martin,2014-11-30,150.2
Lockheed Martin,2014-12-31,151.4
Lockheed Martin,2015-01-31,152.7
Lockheed Martin,2015-02-28,154.5
Lockheed Martin,2015-03-31,159.2
Lockheed Martin,2015-04-30,145.0
Lockheed Martin,2015-05-31,145.5
Lockheed Martin,2015-06-30,146.6
Lockheed Martin,2015-07-31,160.0
Lockheed Martin,2015-08-31,166.6
Lockheed Martin,2015-09-30,176.0
Lockheed Martin,2015-10-31,172.1
Lockheed Martin,2015-11-30,172.3
Lockheed Martin,2015-12-31,173.5
Lockheed Martin,2016-01-31,177.4
Lockheed Martin,2016-02-29,183.1
Lockheed Martin,2016-03-31,176.0
Lockheed Martin,2016-04-30,183.9
Lockheed Martin,2016-05-31,184.9
Lockheed Martin,2016-06-30,193.7
Lockheed Martin,2016-07-31,190.3
Lockheed Martin,2016-08-31,183.9
Lockheed Martin,2016-09-30,181.4
Lockheed Martin,2016-10-31,190.0
Lockheed Martin,2016-11-30,198.5
Lockheed Martin,2016-12-31,183.5
Lockheed Martin,2017-01-31,181.1
Lockheed Martin,2017-02-28,186.0
Lockheed Martin,2017-03-31,186.5
Lockheed Martin,2017-04-30,185.8
Lockheed Martin,2017-05-31,192.4
Lockheed Martin,2017-06-30,188.9
Lockheed Martin,2017-07-31,194.7
Lockheed Martin,2017-08-31,204.1
Lockheed Martin,2017-09-30,203.2
Lockheed Martin,2017-10-31,197.2
Lockheed Martin,2017-11-30,199.4
Lockheed Martin,2017-12-31,198.4
Lockheed Martin,2018-01-31,207.4
Lockheed Martin,2018-02-28,215.1
Lockheed Martin,2018-03-31,211.7
Lockheed Martin,2018-04-30,200.2
Lockheed Martin,2018-05-31,192.9
Lockheed Martin,2018-06-30,180.0
Lockheed Martin,2018-07-31,191.6
Lockheed Martin,2018-08-31,183.4
Lockheed Martin,2018-09-30,197.0
Lockheed Martin,2018-10-31,179.6
Lockheed Martin,2018-11-30,181.2
Lockheed Martin,2018-12-31,173.6
Lockheed Martin,2019-01-31,177.9
Lockheed Martin,2019-02-28,185.4
Lockheed Martin,2019-03-31,176.4
Lockheed Martin,2019-04-30,188.3
Lockheed Martin,2019-05-31,205.5
Lockheed Martin,2019-06-30,206.2
Lockheed Martin,2019-07-31,202.5
Lockheed Martin,2019-08-31,219.4
Lockheed Martin,2019-09-30,218.7
Lockheed Martin,2019-10-31,206.8
Lockheed Martin,2019-11-30,208.4
Lockheed Martin,2019-12-31,201.4
Lockheed Martin,2020-01-31,221.6
Lockheed Martin,2020-02-29,210.0
Lockheed Martin,2020-03-31,219.5
Lockheed Martin,2020-04-30,223.4
Lockheed Martin,2020-05-31,214.2
Lockheed Martin,2020-06-30,197.3
Lockheed Martin,2020-07-31,193.9
Lockheed Martin,2020-08-31,187.5
Lockheed Martin,2020-09-30,191.4
`,
  },
  {
    name: 'Balken, mehrere',
    screenshot: '/static/charts/multi-bars.png',
    config: {
      type: 'Bar',
      color: 'type',
      colorSort: 'none',
      numberFormat: '.0%',
      sort: 'none',
      column: 'type',
      y: 'category',
      columns: 3,
      minInnerWidth: 250,
    },
    values: `
category,type,value
"Sprachen, Kultur, Politik",Nicht-berufsbezogene Weiterbildung,0.32
Pädagogik und Sozialkompetenz,Nicht-berufsbezogene Weiterbildung,0.07
"Sprachen, Kultur, Politik",Individuelle berufsbezogene Weiterbildung,0.15
Pädagogik und Sozialkompetenz,Individuelle berufsbezogene Weiterbildung,0.17
`,
  },
  {
    name: 'Säulen (zeitlich), mehrere',
    screenshot: '/static/charts/multi-timebars.png',
    config: {
      type: 'TimeBar',
      xTicks: [1965, 1975, 1985, 1995],
      xInterval: 'year',
      xIntervalStep: 10,
      column: 'activity',
      columns: 2,
      unit: 'Minuten',
    },
    values: `
year,activity,value
1965,Mahlzeit vorbereiten,44
1975,Mahlzeit vorbereiten,41
1985,Mahlzeit vorbereiten,39
1995,Mahlzeit vorbereiten,27
1965,Tisch und Küche aufräumen,21
1975,Tisch und Küche aufräumen,12
1985,Tisch und Küche aufräumen,10
1995,Tisch und Küche aufräumen,4
`,
  },
  {
    name: 'Säulen (ordinal), mehrere',
    screenshot: '/static/charts/multi-timebars-ordinal.png',
    config: {
      type: 'TimeBar',
      numberFormat: 's',
      column: 'book',
      columns: 2,
      domain: [0, 45000],
      x: 'length',
      xScale: 'ordinal',
      xUnit: 'Buchstaben pro Wort',
      unit: 'Wörter',
      colorRange: ['#FF5768'],
      xTicks: [1, 5, 10, 15, 20, 25, 30],
      yTicks: [0, 20000, 40000],
      padding: 15,
    },
    values: `
length,book,value
1,«Les Misérables»,10225
1,«Notre-Dame de Paris»,14492
2,«Les Misérables»,28955
2,«Notre-Dame de Paris»,44720
3,«Les Misérables»,15969
3,«Notre-Dame de Paris»,24651
4,«Les Misérables»,14859
4,«Notre-Dame de Paris»,21912
5,«Les Misérables»,13689
5,«Notre-Dame de Paris»,21187
6,«Les Misérables»,11098
6,«Notre-Dame de Paris»,17235
7,«Les Misérables»,8582
7,«Notre-Dame de Paris»,13557
8,«Les Misérables»,6503
8,«Notre-Dame de Paris»,9523
9,«Les Misérables»,4067
9,«Notre-Dame de Paris»,7344
10,«Les Misérables»,2519
10,«Notre-Dame de Paris»,4427
11,«Les Misérables»,1470
11,«Notre-Dame de Paris»,2789
12,«Les Misérables»,789
12,«Notre-Dame de Paris»,1487
13,«Les Misérables»,429
13,«Notre-Dame de Paris»,654
14,«Les Misérables»,210
14,«Notre-Dame de Paris»,323
15,«Les Misérables»,89
15,«Notre-Dame de Paris»,136
16,«Les Misérables»,40
16,«Notre-Dame de Paris»,90
17,«Les Misérables»,57
17,«Notre-Dame de Paris»,23
18,«Les Misérables»,4
18,«Notre-Dame de Paris»,35
19,«Les Misérables»,3
19,«Notre-Dame de Paris»,7
20,«Notre-Dame de Paris»,7
20,«Les Misérables»,0
21,«Les Misérables»,4
21,«Notre-Dame de Paris»,6
22,«Les Misérables»,1
22,«Notre-Dame de Paris»,13
23,«Notre-Dame de Paris»,6
23,«Les Misérables»,0
24,«Notre-Dame de Paris»,0
24,«Les Misérables»,0
25,«Les Misérables»,1
25,«Notre-Dame de Paris»,0
26,«Les Misérables»,1
26,«Notre-Dame de Paris»,1
27,«Les Misérables»,0
27,«Notre-Dame de Paris»,0
28,«Notre-Dame de Paris»,1
28,«Les Misérables»,0
29,«Notre-Dame de Paris»,8
29,«Les Misérables»,0
`,
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
      xTicks: [0, 6502, 10000, 15000],
    },
    values: `
category,value,Q_lower,Q_upper
Informationstechnologie,8900,6918,11373
Forschung und Entwicklung,8764,7143,11837
Energieversorgung,8210,6873,10182
`,
  },
  {
    name: 'Gestapelte Balken',
    screenshot: '/static/charts/filled-bars.png',
    config: {
      type: 'Bar',
      numberFormat: '.0%',
      color: 'concern',
      colorRange: 'diverging2',
      colorLegend: true,
      y: 'category',
      domain: [0, 1],
      sort: 'none',
      colorSort: 'none',
      highlight: "datum.category == 'Allgemein'",
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
`,
  },
  {
    name: 'Gestapelte Säulen (zeitlich)',
    screenshot: '/static/charts/stacked-timebars.png',
    config: {
      type: 'TimeBar',
      color: 'gas',
      unit: 'Tonnen',
      numberFormat: 's',
      xAnnotations: [
        {
          x1: '2008',
          x2: '2012',
          value: 973619338.97,
          unit: 'Tonnen',
          label: 'Kyoto-Protokoll',
        },
        { x: '2020', value: 748700000, label: 'Ziel 2020', ghost: true },
        {
          x: '2050',
          value: 249600000,
          label: 'Ziel 2050',
          valuePrefix: 'max: ',
          ghost: true,
        },
      ],
      padding: 18,
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
`,
  },
  {
    name: 'Linie mit Unsicherheitsbereich',
    screenshot: '/static/charts/bands.png',
    config: {
      numberFormat: '.2f',
      color: 'category',
      band: 'confidence95',
      bandLegend: '95-Prozent-Konfidenzintervall',
      type: 'Line',
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
`,
  },
  {
    name: 'Gestrichelte Linien',
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
        'bereits Infizierte': 'rgba(127,191,123, 0.9)',
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
          showValue: false,
        },
      ],
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
    `,
  },
  {
    name: 'Steigungslinien',
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
      type: 'Slope',
    },
    values: `
year,country,value
1870,Österreich,0.689443115818244
1870,Deutschland,0.806969593440383
2016,Österreich,0.727798978073863
2016,Deutschland,0.75740573054783
`,
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
        'Average Joe in {geo} emitted {formattedY} tons of CO<sub>2</sub> in 2014.\nIn the same period of time, Joe worked and worked and earned himself {formattedX} USD.',
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
`,
  },
  {
    name: 'Punktekarte, Schweiz',
    screenshot: '/static/charts/dotmap.png',
    config: {
      type: 'SwissMap',
      points: true,
      color: 'word',
      colorLegend: true,
      pointLabel: 'nameCanton',
      pointAttributes: ['word'],
      sizeRangeMax: 40,
      colorMap: {
        'Wienacht(s)-': '#3182bd',
        'Wiene-': '#9ecae1',
        'Chrisch(t)-': '#de2d26',
        Chrischindli: '#fc9272',
        'St. Niklaus': '#31a354',
        'Mehr als eine Variante': '#54278f',
      },
      features: {
        url: 'https://cdn.repub.ch/s3/republik-assets/assets/geo/ch-cantons-wo-lakes.json',
        object: 'cantons',
      },
    },
    values: `
BFS_CODE,SDS_CODE,SDS_NAME,SDS_KT,SDS_NR,cnt_primar,c_total,lon,lat,word,variant,nameCanton
4253,AG1,Magden,AG,1,NA,1,7.81409894515374,47.5284203220397,Wienacht(s)-,1,Magden (AG)
4262,AG4,Wegenstetten,AG,4,NA,1,7.9346820622255,47.4991830109181,Wienacht(s)-,1,Wegenstetten (AG)
4097,AG8,Elfingen,AG,8,NA,1,8.10071608164195,47.5082481090387,Wienacht(s)-,1,Elfingen (AG)
4117,AG27,Thalheim,AG,27,NA,1,8.1024955558092,47.4380739992599,Wienacht(s)-,1,Thalheim (AG)
4095,AG29,Brugg,AG,29,NA,1,8.20790503205714,47.4841979117172,Wienacht(s)-,1,Brugg (AG)
4006,AG36,Gränichen,AG,36,NA,1,8.10151053501525,47.3589184481184,Wienacht(s)-,1,Gränichen (AG)
4145,AG37,Teufenthal,AG,37,NA,1,8.11835303551092,47.3300341788,Wienacht(s)-,1,Teufenthal (AG)
4201,AG38,Lenzburg,AG,38,NA,1,8.1747653481653,47.3908595663211,Wienacht(s)-,1,Lenzburg (AG)
4195,AG39,Egliswil,AG,39,NA,1,8.18877869852519,47.3511881497151,Wienacht(s)-,1,Egliswil (AG)
4289,AG47,Zofingen,AG,47,NA,1,7.94596617529953,47.2904393864861,Wienacht(s)-,1,Zofingen (AG)
4147,AG53,Zetzwil,AG,53,NA,1,8.15085354506411,47.2866580641524,Wienacht(s)-,1,Zetzwil (AG)
4196,AG56,Fahrwangen,AG,56,NA,1,8.24354098582342,47.2959442464288,Wienacht(s)-,1,Fahrwangen (AG)
2701,BA1,Basel,BA,1,NA,1,7.58974518579751,47.5604107703719,Wienacht(s)-,1,Basel (BA)
2702,BA2,Bettingen,BA,2,NA,1,7.66686913339274,47.5719783496114,Wienacht(s)-,1,Bettingen (BA)
2774,BA3,Schönenbuch,BA,3,NA,1,7.50201469922297,47.5389037098985,Wienacht(s)-,1,Schönenbuch (BA)
2764,BA4,Benken,BA,4,NA,1,7.52852997914018,47.5083036872932,Wienacht(s)-,1,Benken (BA)
2768,BA5,Ettingen,BA,5,NA,1,7.54573613603034,47.4822036859796,Wienacht(s)-,1,Ettingen (BA)
2775,BA6,Therwil,BA,6,NA,1,7.55506358335281,47.5001847731919,Wienacht(s)-,1,Therwil (BA)
2761,BA7,Aesch,BA,7,NA,1,7.59744810395859,47.4695515661175,Wienacht(s)-,1,Aesch (BA)
2763,BA8,Arlesheim,BA,8,NA,1,7.62141595490953,47.4956020109754,Wienacht(s)-,1,Arlesheim (BA)
2831,BA9,Pratteln,BA,9,NA,1,7.69587140649361,47.5224460048403,Wienacht(s)-,1,Pratteln (BA)
2821,BA10,Arisdorf,BA,10,NA,1,7.76618945091591,47.5123744355744,Wienacht(s)-,1,Arisdorf (BA)
2866,BA11,Wintersingen,BA,11,NA,1,7.82580930587837,47.4951001648146,Wienacht(s)-,1,Wintersingen (BA)
2853,BA12,Maisprach,BA,12,NA,1,7.84727938817207,47.5256097079378,Wienacht(s)-,1,Maisprach (BA)
2834,BA13,Ziefen,BA,13,NA,1,7.70869466559633,47.4324659401517,Wienacht(s)-,1,Ziefen (BA)
2829,BA14,Liestal,BA,14,NA,1,7.73550808374118,47.4863713454084,Wienacht(s)-,1,Liestal (BA)
2823,BA15,Bubendorf,BA,15,NA,1,7.73795502965697,47.4494849962444,Wienacht(s)-,1,Bubendorf (BA)
2869,BA17,Zunzgen,BA,17,NA,1,7.80824343495597,47.4501816943313,Wienacht(s)-,1,Zunzgen (BA)
2843,BA18,Buckten,BA,18,NA,1,7.84640423255542,47.4113738780974,Wienacht(s)-,1,Buckten (BA)
2846,BA19,Gelterkinden,BA,19,NA,1,7.85610251101212,47.4653110222309,Wienacht(s)-,1,Gelterkinden (BA)
2868,BA20,Zeglingen,BA,20,NA,1,7.90609771858162,47.4183444960126,Wienacht(s)-,1,Zeglingen (BA)
2865,BA21,Wenslingen,BA,21,NA,1,7.91159836807465,47.4408105165008,Wienacht(s)-,1,Wenslingen (BA)
2858,BA22,Rothenfluh,BA,22,NA,1,7.91576114161904,47.4614825982918,Wienacht(s)-,1,Rothenfluh (BA)
2893,BA23,Reigoldswil,BA,23,NA,1,7.69262413236389,47.3983202195257,Wienacht(s)-,1,Reigoldswil (BA)
2895,BA24,Waldenburg,BA,24,NA,1,7.74685301371796,47.3828965270696,Wienacht(s)-,1,Waldenburg (BA)
2888,BA25,Langenbruck,BA,25,NA,1,7.76784415399576,47.3504551630693,Wienacht(s)-,1,Langenbruck (BA)
2885,BA26,Eptingen,BA,26,NA,1,7.8210527177332,47.3871728771031,Wienacht(s)-,1,Eptingen (BA)
2790,BE1,Roggenburg,BE,1,NA,1,7.34147832387526,47.4354362388502,Wienacht(s)-,1,Roggenburg (BE)
2788,BE2,Liesberg,BE,2,NA,1,7.43030845739738,47.4048937933927,Wienacht(s)-,1,Liesberg (BE)
2781,BE4,Blauen,BE,4,NA,1,7.52047831534919,47.4516408379024,Wienacht(s)-,1,Blauen (BE)
740,BE13,Ligerz,BE,13,NA,1,7.13796832157507,47.086051678655,Wienacht(s)-,1,Ligerz (BE)
752,BE14,Tüscherz,BE,14,NA,1,7.1970987231409,47.1167783019967,Wienacht(s)-,1,Tüscherz (BE)
371,BE15,Biel,BE,15,NA,1,7.24840149407165,47.1429634135281,Wienacht(s)-,1,Biel (BE)
738,BE16,Jens,BE,16,NA,1,7.26305036147835,47.098906622594,Wienacht(s)-,1,Jens (BE)
383,BE19,Büren,BE,19,NA,1,7.37366177168503,47.1404047715697,Wienacht(s)-,1,Büren (BE)
552,BE22,Utzenstorf,BE,22,NA,1,7.55821614722388,47.1286677383457,Wienacht(s)-,1,Utzenstorf (BE)
492,BE27,Erlach,BE,27,NA,1,7.09740325075358,47.0445556925516,Wienacht(s)-,1,Erlach (BE)
496,BE28,Ins,BE,28,NA,1,7.10552952129088,47.0076952092518,Wienacht(s)-,1,Ins (BE)
499,BE29,Siselen,BE,29,NA,1,7.19089408371007,47.0340011283608,Wienacht(s)-,1,Siselen (BE)
751,BE30,Täuffelen,BE,30,NA,1,7.20126856295569,47.0682084109173,Wienacht(s)-,1,Täuffelen (BE)
404,BE38,Burgdorf,BE,38,NA,1,7.62387828875442,47.0575125884353,Wienacht(s)-,1,Burgdorf (BE)
951,BE41,Affoltern,BE,41,NA,1,7.73318733370177,47.0662810423566,Wienacht(s)-,1,Affoltern (BE)
908,BE53,Fankhaus,BE,53,NA,1,7.90874299973141,46.9667382337346,Wienacht(s)-,1,Fankhaus (BE)
861,BE58,Belp,BE,58,NA,1,7.50126333054638,46.8921137645143,Wienacht(s)-,1,Belp (BE)
612,BE60,Konolfingen,BE,60,NA,1,7.62195866821358,46.8802897078016,Wienacht(s)-,1,Konolfingen (BE)
942,BE74,Thun,BE,74,NA,1,7.62547174335154,46.7579322516863,Wienacht(s)-,1,Thun (BE)
593,BE79,Unterseen,BE,79,NA,1,7.84746646193663,46.6853812606911,Wienacht(s)-,1,Unterseen (BE)
579,BE80,Habkern,BE,80,NA,1,7.86479450095476,46.7276023188286,Wienacht(s)-,1,Habkern (BE)
589,BE81,Oberried am Brienzersee,BE,81,NA,1,7.96433965164582,46.7388833687649,Wienacht(s)-,1,Oberried am Brienzersee (BE)
582,BE82,Iseltwald,BE,82,NA,1,7.96537617980166,46.7109887097522,Wienacht(s)-,1,Iseltwald (BE)
574,BE84,Brienzwiler,BE,84,NA,1,8.10192675768553,46.7534618818506,Wienacht(s)-,1,Brienzwiler (BE)
785,BE85,Meiringen,BE,85,NA,1,8.18797709058918,46.7286380698855,Wienacht(s)-,1,Meiringen (BE)
784,BE86,Innertkirchen,BE,86,NA,1,8.22952615104919,46.7067649796216,Wienacht(s)-,1,Innertkirchen (BE)
781,BE88,Gadmen,BE,88,NA,1,8.35434146085827,46.7400206902173,Wienacht(s)-,1,Gadmen (BE)
761,BE89,Nidfluh,BE,89,NA,1,7.51405886864371,46.655498674086,Wienacht(s)-,1,Nidfluh (BE)
791,BE90,Boltigen,BE,90,NA,1,7.39387406217755,46.6303233630083,Wienacht(s)-,1,Boltigen (BE)
843,BE93,Saanen-Gstaad,BE,93,NA,1,7.2767890186064,46.4799716632642,Wienacht(s)-,1,Saanen-Gstaad (BE)
841,BE94,Gsteig,BE,94,NA,1,7.26796904905913,46.3863928145389,Wienacht(s)-,1,Gsteig (BE)
842,BE95,Lauenen,BE,95,NA,1,7.32379103325074,46.4251494686505,Wienacht(s)-,1,Lauenen (BE)
762,BE99,Hinteres Diemtigtal,BE,99,NA,1,7.5192056026966,46.6015154857466,Wienacht(s)-,1,Hinteres Diemtigtal (BE)
563,BE103,Ried,BE,103,NA,1,7.61827597073706,46.5618176650437,Wienacht(s)-,1,Ried (BE)
567,BE107,Kiental,BE,107,NA,1,7.72407706484945,46.5903915505468,Wienacht(s)-,1,Kiental (BE)
576,BE112,Grindelwald,BE,112,NA,1,8.03637456440759,46.6260687427075,Wienacht(s)-,1,Grindelwald (BE)
2275,FR1,Murten,FR,1,NA,1,7.11915409762004,46.9285667043077,Wienacht(s)-,1,Murten (FR)
1003,LU31,Escholzmatt,LU,31,NA,1,7.93586575941495,46.9153441834946,Wienacht(s)-,1,Escholzmatt (LU)
2619,SO1,Kleinlützel,SO,1,NA,1,7.39584339905376,47.4237758652184,Wienacht(s)-,1,Kleinlützel (SO)
2479,SO2,Rodersdorf,SO,2,NA,1,7.45816008485707,47.4822509110412,Wienacht(s)-,1,Rodersdorf (SO)
2476,SO3,Hofstetten,SO,3,NA,1,7.51653632313289,47.4768297759227,Wienacht(s)-,1,Hofstetten (SO)
2475,SO4,Hochwald,SO,4,NA,1,7.64118121093605,47.4577899356788,Wienacht(s)-,1,Hochwald (SO)
2480,SO5,Seewen,SO,5,NA,1,7.65965626796353,47.4352683119564,Wienacht(s)-,1,Seewen (SO)
2613,SO8,Breitenbach,SO,8,NA,1,7.54426394773248,47.4084448244181,Wienacht(s)-,1,Breitenbach (SO)
2621,SO9,Nunningen,SO,9,NA,1,7.61974711265121,47.3948588064891,Wienacht(s)-,1,Nunningen (SO)
2499,SO13,Stüsslingen,SO,13,NA,1,7.97078534035163,47.3928778440543,Wienacht(s)-,1,Stüsslingen (SO)
2572,SO14,Däniken,SO,14,NA,1,7.98366413857144,47.3568356575333,Wienacht(s)-,1,Däniken (SO)
2422,SO18,Balsthal,SO,18,NA,1,7.69488548806128,47.317356363235,Wienacht(s)-,1,Balsthal (SO)
2578,SO22,Gunzgen,SO,22,NA,1,7.8298101668383,47.3169786297146,Wienacht(s)-,1,Gunzgen (SO)
2553,SO24,Oberdorf,SO,24,NA,1,7.50429637564445,47.2312631092494,Wienacht(s)-,1,Oberdorf (SO)
2461,SO29,Schnottwil,SO,29,NA,1,7.3921445334871,47.1125264967643,Wienacht(s)-,1,Schnottwil (SO)
4121,AG12,Villigen,AG,12,NA,1,8.2164975652878,47.5273184091489,Wiene-,1,Villigen (AG)
4104,AG28,Lupfig,AG,28,NA,1,8.20465559172612,47.4428401050769,Wiene-,1,Lupfig (AG)
4009,AG35,Muhen,AG,35,NA,1,8.05496979441122,47.3411847016806,Wiene-,1,Muhen (AG)
4208,AG40,Seengen,AG,40,NA,1,8.20694611909421,47.3258803164355,Wiene-,1,Seengen (AG)
4279,AG44,Riken,AG,44,NA,1,7.85589347009342,47.269210299654,Wiene-,1,Riken (AG)
4271,AG45,Aarburg,AG,45,NA,1,7.90127893987213,47.3212123930112,Wiene-,1,Aarburg (AG)
4274,AG46,Brittnau,AG,46,NA,1,7.9483187106795,47.2598433556743,Wiene-,1,Brittnau (AG)
4283,AG48,Safenwil,AG,48,NA,1,7.98463817909178,47.3226475967867,Wiene-,1,Safenwil (AG)
4281,AG49,Reitnau,AG,49,NA,1,8.04600603556676,47.2512740697292,Wiene-,1,Reitnau (AG)
4144,AG50,Schöftland,AG,50,NA,1,8.05191997771788,47.3061175203613,Wiene-,1,Schöftland (AG)
4275,AG51,Kirchleerau,AG,51,NA,1,8.06877265709816,47.2772400596855,Wiene-,1,Kirchleerau (AG)
4143,AG52,Schmiedrued,AG,52,NA,1,8.10826774729113,47.2644232755839,Wiene-,1,Schmiedrued (AG)
992,BE5,Wangen,BE,5,NA,1,7.65619166463637,47.2355753521855,Wiene-,1,Wangen (BE)
996,BE6,Wolfisberg,BE,6,NA,1,7.66295735174754,47.2742438542669,Wiene-,1,Wolfisberg (BE)
986,BE7,Röthenbach,BE,7,NA,1,7.68247621611879,47.2067364335691,Wiene-,1,Röthenbach (BE)
981,BE8,Niederbipp,BE,8,NA,1,7.6972919416517,47.2678752018466,Wiene-,1,Niederbipp (BE)
324,BE9,Bleienbach,BE,9,NA,1,7.75759632639004,47.1858628476177,Wiene-,1,Bleienbach (BE)
321,BE10,Aarwangen,BE,10,NA,1,7.7711377057528,47.2415987013829,Wiene-,1,Aarwangen (BE)
329,BE11,Langenthal,BE,11,NA,1,7.78812758205249,47.2136615422211,Wiene-,1,Langenthal (BE)
333,BE12,Melchnau,BE,12,NA,1,7.85258889698249,47.1837617521406,Wiene-,1,Melchnau (BE)
384,BE17,Busswil,BE,17,NA,1,7.32628213252038,47.1007856305646,Wiene-,1,Busswil (BE)
388,BE20,Leuzigen,BE,20,NA,1,7.45805348794211,47.1755060723582,Wiene-,1,Leuzigen (BE)
542,BE21,Limpach,BE,21,NA,1,7.49624348437482,47.109823528123,Wiene-,1,Limpach (BE)
988,BE23,Seeberg,BE,23,NA,1,7.6703508731887,47.1500874778278,Wiene-,1,Seeberg (BE)
424,BE24,Wynigen,BE,24,NA,1,7.66752951907816,47.1069124770983,Wiene-,1,Wynigen (BE)
344,BE25,Ursenbach,BE,25,NA,1,7.77313328044595,47.1381403649101,Wiene-,1,Ursenbach (BE)
954,BE26,Huttwil,BE,26,NA,1,7.84942572004642,47.1154034292113,Wiene-,1,Huttwil (BE)
301,BE31,Aarberg,BE,31,NA,1,7.27901572374974,47.0467529362929,Wiene-,1,Aarberg (BE)
307,BE32,Meikirch,BE,32,NA,1,7.36461429777333,47.0108563331216,Wiene-,1,Meikirch (BE)
394,BE33,Wengi,BE,33,NA,1,7.39744808663054,47.0711469570598,Wiene-,1,Wengi (BE)
546,BE34,Münchenbuchsee,BE,34,NA,1,7.4514231350363,47.0225752195249,Wiene-,1,Münchenbuchsee (BE)
557,BE35,Zuzwil,BE,35,NA,1,7.47380615261528,47.0522578654039,Wiene-,1,Zuzwil (BE)
539,BE36,Grafenried,BE,36,NA,1,7.51069849284745,47.0801286928257,Wiene-,1,Grafenried (BE)
414,BE37,Krauchthal,BE,37,NA,1,7.56716214465365,47.0108098513719,Wiene-,1,Krauchthal (BE)
956,BE39,Rüegsau,BE,39,NA,1,7.67508288447172,47.0268320486654,Wiene-,1,Rüegsau (BE)
955,BE40,Lützelflüh,BE,40,NA,1,7.68552127054583,47.0079181503284,Wiene-,1,Lützelflüh (BE)
957,BE42,Sumiswald,BE,42,NA,1,7.74614223379061,47.0293629372451,Wiene-,1,Sumiswald (BE)
953,BE43,Eriswil,BE,43,NA,1,7.85179110412182,47.0803101244252,Wiene-,1,Eriswil (BE)
662,BE44,Ferenbalm,BE,44,NA,1,7.21233983534985,46.9413845020483,Wiene-,1,Ferenbalm (BE)
309,BE45,Detligen,BE,45,NA,1,7.27392086402281,46.9918691460877,Wiene-,1,Detligen (BE)
352,BE48,Habstetten,BE,48,NA,1,7.49610195201547,46.9757818051674,Wiene-,1,Habstetten (BE)
627,BE49,Worb,BE,49,NA,1,7.56434538644085,46.9307465236988,Wiene-,1,Worb (BE)
626,BE50,Walkringen,BE,50,NA,1,7.62087415897002,46.9477638964926,Wiene-,1,Walkringen (BE)
903,BE51,Lauperswil,BE,51,NA,1,7.74580821033624,46.9708882921046,Wiene-,1,Lauperswil (BE)
902,BE52,Langnau,BE,52,NA,1,7.78636405803873,46.9419844340377,Wiene-,1,Langnau (BE)
667,BE54,Laupen,BE,54,NA,1,7.24006457174185,46.9036516307481,Wiene-,1,Laupen (BE)
670,BE55,Neuenegg,BE,55,NA,1,7.30440106792651,46.8965486790872,Wiene-,1,Neuenegg (BE)
357,BE56,Oberbalm,BE,56,NA,1,7.40547332694571,46.8750322464138,Wiene-,1,Oberbalm (BE)
355,BE57,Köniz,BE,57,NA,1,7.41595250063518,46.9119198654757,Wiene-,1,Köniz (BE)
632,BE59,Niederwichtrach,BE,59,NA,1,7.57727294198823,46.8506641716133,Wiene-,1,Niederwichtrach (BE)
907,BE61,Signau,BE,61,NA,1,7.72714348352001,46.9214569311018,Wiene-,1,Signau (BE)
901,BE62,Eggiwil,BE,62,NA,1,7.79774791950271,46.8762756221541,Wiene-,1,Eggiwil (BE)
852,BE63,Guggisberg,BE,63,NA,1,7.32959900485832,46.7688264851732,Wiene-,1,Guggisberg (BE)
854,BE64,Schwarzenburg,BE,64,NA,1,7.34260166486808,46.8192184996494,Wiene-,1,Schwarzenburg (BE)
880,BE65,Rüeggisberg,BE,65,NA,1,7.44089398472273,46.8228582388003,Wiene-,1,Rüeggisberg (BE)
883,BE66,Seftigen,BE,66,NA,1,7.54044105153327,46.7895268343141,Wiene-,1,Seftigen (BE)
928,BE67,Heimberg,BE,67,NA,1,7.60725956172086,46.7948461308362,Wiene-,1,Heimberg (BE)
923,BE68,Heimenschwand,BE,68,NA,1,7.69648297097569,46.825268286604,Wiene-,1,Heimenschwand (BE)
945,BE69,Schwarzenegg,BE,69,NA,1,7.70158999810619,46.7973675620227,Wiene-,1,Schwarzenegg (BE)
924,BE70,Eriz,BE,70,NA,1,7.77883576197573,46.7899669166879,Wiene-,1,Eriz (BE)
922,BE72,Blumenstein,BE,72,NA,1,7.52203029686125,46.7418601790106,Wiene-,1,Blumenstein (BE)
767,BE73,Reutigen,BE,73,NA,1,7.62133514461873,46.6958626806594,Wiene-,1,Reutigen (BE)
768,BE75,Faulensee,BE,75,NA,1,7.71013179605483,46.67229522672,Wiene-,1,Faulensee (BE)
938,BE76,Schwanden,BE,76,NA,1,7.71699970227578,46.7370542900213,Wiene-,1,Schwanden (BE)
938,BE77,Merligen,BE,77,NA,1,7.73903023808469,46.698313160495,Wiene-,1,Merligen (BE)
585,BE78,Leissigen,BE,78,NA,1,7.77406802401094,46.6550317398439,Wiene-,1,Leissigen (BE)
843,BE92,Abländschen,BE,92,NA,1,7.29346715649676,46.5735598759637,Wiene-,1,Abländschen (BE)
793,BE96,St. Stephan,BE,96,NA,1,7.3965812896813,46.5106689936024,Wiene-,1,St. Stephan (BE)
792,BE97,Oberried,BE,97,NA,1,7.47861188005729,46.4216032018117,Wiene-,1,Oberried (BE)
762,BE98,Vorderes Diemtigtal,BE,98,NA,1,7.58065009689008,46.6383420781249,Wiene-,1,Vorderes Diemtigtal (BE)
562,BE100,Aeschiried,BE,100,NA,1,7.73999714474167,46.6371333953077,Wiene-,1,Aeschiried (BE)
563,BE102,Frutigen,BE,102,NA,1,7.6483830180515,46.5896560479476,Wiene-,1,Frutigen (BE)
564,BE105,Kandergrund,BE,105,NA,1,7.66386745040566,46.5473421368272,Wiene-,1,Kandergrund (BE)
565,BE106,Kandersteg,BE,106,NA,1,7.69485276660435,46.4816006862305,Wiene-,1,Kandersteg (BE)
577,BE108,Gsteigwiler,BE,108,NA,1,7.87468017591565,46.6555914001248,Wiene-,1,Gsteigwiler (BE)
578,BE109,Gündlischwand,BE,109,NA,1,7.91368755134755,46.6338434219024,Wiene-,1,Gündlischwand (BE)
584,BE110,Lauterbrunnen,BE,110,NA,1,7.90806537294753,46.5879830921943,Wiene-,1,Lauterbrunnen (BE)
584,BE111,Gimmelwald,BE,111,NA,1,7.89077079322974,46.5484671056894,Wiene-,1,Gimmelwald (BE)
2296,FR10,Heitenried,FR,10,NA,1,7.30064049515975,46.8281716020146,Wiene-,1,Heitenried (FR)
2457,SO30,Messen,SO,30,NA,1,7.4488042909098,47.0936443694481,Wiene-,1,Messen (SO)
2458,SO31,Mühledorf,SO,31,NA,1,7.47649631015645,47.1359197980506,Wiene-,1,Mühledorf (SO)
4254,AG2,Möhlin,AG,2,NA,1,7.84620625759594,47.558894847673,Chrisch(t)-,1,Möhlin (AG)
4256,AG3,Obermumpf,AG,3,NA,1,7.93895989193975,47.5306475110946,Chrisch(t)-,1,Obermumpf (AG)
4259,AG5,Schupfart,AG,5,NA,1,7.96669798067322,47.5152328448206,Chrisch(t)-,1,Schupfart (AG)
4163,AG6,Frick,AG,6,NA,1,8.0223922027956,47.5086691271516,Chrisch(t)-,1,Frick (AG)
4169,AG7,Kaisten,AG,7,NA,1,8.04532948623121,47.5409339153397,Chrisch(t)-,1,Kaisten (AG)
4164,AG9,Gansingen,AG,9,NA,1,8.13570277100214,47.5440238954997,Chrisch(t)-,1,Gansingen (AG)
4180,AG10,Wil,AG,10,NA,1,8.1532138045247,47.5619076499999,Chrisch(t)-,1,Wil (AG)
4311,AG11,Leibstadt,AG,11,NA,1,8.17620369065927,47.5905481283645,Chrisch(t)-,1,Leibstadt (AG)
4303,AG13,Böttstein,AG,13,NA,1,8.22094471843928,47.5587719668322,Chrisch(t)-,1,Böttstein (AG)
4047,AG14,Würenlingen,AG,14,NA,1,8.25907569659643,47.5324220112785,Chrisch(t)-,1,Würenlingen (AG)
4304,AG15,Grossdöttingen,AG,15,NA,1,8.25967308769455,47.5710975731125,Chrisch(t)-,1,Grossdöttingen (AG)
4301,AG17,Baldingen,AG,17,NA,1,8.31658431107991,47.5562881725616,Chrisch(t)-,1,Baldingen (AG)
4312,AG18,Unterlengnau,AG,18,NA,1,8.33062588372039,47.5219983587827,Chrisch(t)-,1,Unterlengnau (AG)
4049,AG19,Oberehrendingen,AG,19,NA,1,8.35154653190034,47.502944766345,Chrisch(t)-,1,Oberehrendingen (AG)
4319,AG20,Siglistorf,AG,20,NA,1,8.38152926912407,47.5467826969406,Chrisch(t)-,1,Siglistorf (AG)
4308,AG21,Kaiserstuhl-Fisibach,AG,21,NA,1,8.41915658077563,47.5698587557454,Chrisch(t)-,1,Kaiserstuhl-Fisibach (AG)
4181,AG22,Wittnau,AG,22,NA,1,7.97564692601044,47.4810100151007,Chrisch(t)-,1,Wittnau (AG)
4173,AG23,Oberhof,AG,23,NA,1,8.00716460093781,47.4502755603575,Chrisch(t)-,1,Oberhof (AG)
4166,AG25,Herznach,AG,25,NA,1,8.05384726039354,47.4734248363334,Chrisch(t)-,1,Herznach (AG)
4004,AG26,Densbüren,AG,26,NA,1,8.05363944162506,47.4554352266128,Chrisch(t)-,1,Densbüren (AG)
4035,AG31,Niederrohrdorf,AG,31,NA,1,8.30646721012312,47.4250293523825,Chrisch(t)-,1,Niederrohrdorf (AG)
4048,AG32,Würenlos,AG,32,NA,1,8.36512864431674,47.4443650072984,Chrisch(t)-,1,Würenlos (AG)
4040,AG33,Spreitenbach,AG,33,NA,1,8.36601581583141,47.4191696535624,Chrisch(t)-,1,Spreitenbach (AG)
4001,AG34,Aarau,AG,34,NA,1,8.04627976991025,47.3916062578873,Chrisch(t)-,1,Aarau (AG)
4068,AG41,Hägglingen,AG,41,NA,1,8.25553600036575,47.3885178045298,Chrisch(t)-,1,Hägglingen (AG)
4031,AG42,Künten,AG,42,NA,1,8.33107704322239,47.3906579272407,Chrisch(t)-,1,Künten (AG)
4063,AG43,Bremgarten-Widen-Zufikon,AG,43,NA,1,8.34498921299947,47.3518671002279,Chrisch(t)-,1,Bremgarten-Widen-Zufikon (AG)
4139,AG54,Menziken,AG,54,NA,1,8.18859750538869,47.2441375506561,Chrisch(t)-,1,Menziken (AG)
4228,AG57,Boswil,AG,57,NA,1,8.31372042558429,47.3017305495729,Chrisch(t)-,1,Boswil (AG)
4079,AG58,Unterlunkhofen,AG,58,NA,1,8.38286306624786,47.3227761611809,Chrisch(t)-,1,Unterlunkhofen (AG)
4234,AG59,Merenschwand,AG,59,NA,1,8.37517535761784,47.2616647019614,Chrisch(t)-,1,Merenschwand (AG)
4223,AG60,Auw,AG,60,NA,1,8.36638824611732,47.2122560271449,Chrisch(t)-,1,Auw (AG)
4231,AG61,Dietwil,AG,61,NA,1,8.39298673471536,47.1490633487008,Chrisch(t)-,1,Dietwil (AG)
3001,AP1,Herisau,AP,1,NA,1,9.27699608218223,47.3902740270525,Chrisch(t)-,1,Herisau (AP)
3007,AP2,Waldstatt,AP,2,NA,1,9.28646692005724,47.3577307420073,Chrisch(t)-,1,Waldstatt (AP)
3006,AP3,Urnäsch,AP,3,NA,1,9.28644965859958,47.3190399800269,Chrisch(t)-,1,Urnäsch (AP)
3024,AP4,Teufen,AP,4,NA,1,9.38836114565368,47.3920469041058,Chrisch(t)-,1,Teufen (AP)
3022,AP5,Gais,AP,5,NA,1,9.45487516956413,47.3639100382628,Chrisch(t)-,1,Gais (AP)
3025,AP6,Trogen,AP,6,NA,1,9.46588457103092,47.4096084855954,Chrisch(t)-,1,Trogen (AP)
3032,AP7,Heiden,AP,7,NA,1,9.53395607114325,47.4551854322152,Chrisch(t)-,1,Heiden (AP)
3037,AP8,Walzenhausen,AP,8,NA,1,9.59519486202084,47.460358412538,Chrisch(t)-,1,Walzenhausen (AP)
3111,AP9,Oberegg,AP,9,NA,1,9.55262727227117,47.4242510293338,Chrisch(t)-,1,Oberegg (AP)
392,BE18,Pieterlen,BE,18,NA,1,7.33799582861523,47.1763622625605,Chrisch(t)-,1,Pieterlen (BE)
663,BE46,Frauenkappelen,BE,46,NA,1,7.33841292656791,46.9559593596555,Chrisch(t)-,1,Frauenkappelen (BE)
782,BE87,Guttannen,BE,87,NA,1,8.29153092367491,46.6577339801988,Chrisch(t)-,1,Guttannen (BE)
561,BE104,Adelboden,BE,104,NA,1,7.55943188160245,46.494419850603,Chrisch(t)-,1,Adelboden (BE)
2262,FR3,Gurmels,FR,3,NA,1,7.17316583070961,46.8945190105788,Chrisch(t)-,1,Gurmels (FR)
2293,FR4,Düdingen,FR,4,NA,1,7.19175504313322,46.8477794672856,Chrisch(t)-,1,Düdingen (FR)
2309,FR5,Wünnewil,FR,5,NA,1,7.27821428198918,46.8758230949288,Chrisch(t)-,1,Wünnewil (FR)
2308,FR6,Ueberstorf,FR,6,NA,1,7.31234816507308,46.8659701598381,Chrisch(t)-,1,Ueberstorf (FR)
2196,FR7,Freiburg,FR,7,NA,1,7.1684065071019,46.7973461486813,Chrisch(t)-,1,Freiburg (FR)
2306,FR8,Tafers,FR,8,NA,1,7.21810975352773,46.816346001578,Chrisch(t)-,1,Tafers (FR)
2291,FR9,Wengliswil,FR,9,NA,1,7.27852690403433,46.7714647803449,Chrisch(t)-,1,Wengliswil (FR)
2294,FR11,Giffers,FR,11,NA,1,7.21053014647057,46.7497568624706,Chrisch(t)-,1,Giffers (FR)
2299,FR12,Plaffeien,FR,12,NA,1,7.28908503699593,46.7417906809881,Chrisch(t)-,1,Plaffeien (FR)
2299,FR13,Schwarzseetal,FR,13,NA,1,7.28928072591702,46.6716177164249,Chrisch(t)-,1,Schwarzseetal (FR)
2138,FR14,Jaun,FR,14,NA,1,7.27900159858136,46.6122259805534,Chrisch(t)-,1,Jaun (FR)
1602,GL1,Bilten,GL,1,NA,1,9.02341644892725,47.1502013521082,Chrisch(t)-,1,Bilten (GL)
1624,GL2,Obstalden,GL,2,NA,1,9.15163661636956,47.1177692231132,Chrisch(t)-,1,Obstalden (GL)
1619,GL3,Näfels,GL,3,NA,1,9.06281242719123,47.1010632080805,Chrisch(t)-,1,Näfels (GL)
1617,GL4,Mollis,GL,4,NA,1,9.07710875277509,47.0945616301657,Chrisch(t)-,1,Mollis (GL)
1609,GL5,Glarus,GL,5,NA,1,9.06762033694469,47.0425082971592,Chrisch(t)-,1,Glarus (GL)
1627,GL6,Schwanden,GL,6,NA,1,9.07408828618003,46.9956262385342,Chrisch(t)-,1,Schwanden (GL)
1614,GL7,Luchsingen,GL,7,NA,1,9.03776333106303,46.9682446377202,Chrisch(t)-,1,Luchsingen (GL)
1626,GL8,Rüti,GL,8,NA,1,9.01718175511229,46.9388363840338,Chrisch(t)-,1,Rüti (GL)
1613,GL9,Auen,GL,9,NA,1,8.99229526247331,46.8959859707775,Chrisch(t)-,1,Auen (GL)
1606,GL10,Engi,GL,10,NA,1,9.15401760978931,46.9863596702529,Chrisch(t)-,1,Engi (GL)
1605,GL11,Elm,GL,11,NA,1,9.17295444440434,46.9212859268266,Chrisch(t)-,1,Elm (GL)
3951,GR1,Fläsch,GR,1,NA,1,9.514600238125,47.0271920239385,Chrisch(t)-,1,Fläsch (GR)
3952,GR2,Jenins,GR,2,NA,1,9.55707709035349,47.0030168494938,Chrisch(t)-,1,Jenins (GR)
3954,GR3,Malans,GR,3,NA,1,9.57867139485914,46.9837167805685,Chrisch(t)-,1,Malans (GR)
3946,GR4,Untervaz,GR,4,NA,1,9.53579046646984,46.9296128214095,Chrisch(t)-,1,Untervaz (GR)
3942,GR5,Igis,GR,5,NA,1,9.55952771780569,46.9651737155289,Chrisch(t)-,1,Igis (GR)
3945,GR6,Trimmis,GR,6,NA,1,9.56612185334739,46.8993544609439,Chrisch(t)-,1,Trimmis (GR)
3973,GR7,Valzeina,GR,7,NA,1,9.60368330197388,46.9517482141269,Chrisch(t)-,1,Valzeina (GR)
3972,GR8,Seewis,GR,8,NA,1,9.63813595432304,46.9906906629083,Chrisch(t)-,1,Seewis (GR)
3862,GR9,Furna,GR,9,NA,1,9.67936471395993,46.9385926246732,Chrisch(t)-,1,Furna (GR)
3962,GR10,Schiers,GR,10,NA,1,9.69122581767636,46.9707597225149,Chrisch(t)-,1,Schiers (GR)
3861,GR11,Fideris,GR,11,NA,1,9.7441224278551,46.9166066065611,Chrisch(t)-,1,Fideris (GR)
3881,GR12,Conters,GR,12,NA,1,9.80003949934227,46.9037660319234,Chrisch(t)-,1,Conters (GR)
3893,GR13,St. Antönien,GR,13,NA,1,9.80583192241025,46.9756492512755,Chrisch(t)-,1,St. Antönien (GR)
3871,GR14,Klosters,GR,14,NA,1,9.88023907729683,46.8768807705262,Chrisch(t)-,1,Klosters (GR)
3731,GR16,Felsberg,GR,16,NA,1,9.47882332249145,46.8478477935267,Chrisch(t)-,1,Felsberg (GR)
3901,GR17,Chur-Masans,GR,17,NA,1,9.52884316296892,46.8523438730006,Chrisch(t)-,1,Chur-Masans (GR)
3911,GR18,Churwalden,GR,18,NA,1,9.53984488801129,46.7981442381915,Chrisch(t)-,1,Churwalden (GR)
3926,GR19,Maladers,GR,19,NA,1,9.56108328577308,46.8382503060935,Chrisch(t)-,1,Maladers (GR)
3925,GR20,Lüen,GR,20,NA,1,9.59970255864031,46.8528262772136,Chrisch(t)-,1,Lüen (GR)
3915,GR21,Tschiertschen,GR,21,NA,1,9.60750113462563,46.8184791310638,Chrisch(t)-,1,Tschiertschen (GR)
3931,GR22,St. Peter,GR,22,NA,1,9.65143424228168,46.8347366559839,Chrisch(t)-,1,St. Peter (GR)
3924,GR23,Langwies,GR,23,NA,1,9.71252868761674,46.8218370471667,Chrisch(t)-,1,Langwies (GR)
3851,GR24,Davos-Frauenkirch,GR,24,NA,1,9.82689290001486,46.7988020929687,Chrisch(t)-,1,Davos-Frauenkirch (GR)
3612,GR25,Obersaxen,GR,25,NA,1,9.1018885881897,46.7468709210189,Chrisch(t)-,1,Obersaxen (GR)
3586,GR26,Brün,GR,26,NA,1,9.31264460984799,46.7841000327524,Chrisch(t)-,1,Brün (GR)
3603,GR27,Vals,GR,27,NA,1,9.18150287084333,46.6178997378863,Chrisch(t)-,1,Vals (GR)
3651,GR28,Safien,GR,28,NA,1,9.31695739959435,46.6823391893509,Chrisch(t)-,1,Safien (GR)
3691,GR29,Hinterrhein,GR,29,NA,1,9.20090766532825,46.5321111537523,Chrisch(t)-,1,Hinterrhein (GR)
3695,GR30,Sufers,GR,30,NA,1,9.36792301903468,46.5716957414014,Chrisch(t)-,1,Sufers (GR)
3668,GR31,Thusis,GR,31,NA,1,9.43909120116159,46.6964598398959,Chrisch(t)-,1,Thusis (GR)
3503,GR32,Mutten,GR,32,NA,1,9.5012490465122,46.6800525766744,Chrisch(t)-,1,Mutten (GR)
3681,GR33,Avers,GR,33,NA,1,9.51423714364256,46.4737211058189,Chrisch(t)-,1,Avers (GR)
3514,GR34,Schmitten,GR,34,NA,1,9.6729421145418,46.6894156615242,Chrisch(t)-,1,Schmitten (GR)
1122,LU1,Altbüron,LU,1,NA,1,7.88292200012064,47.1818496230413,Chrisch(t)-,1,Altbüron (LU)
1139,LU2,Pfaffnau,LU,2,NA,1,7.89917282959906,47.2303637546552,Chrisch(t)-,1,Pfaffnau (LU)
1125,LU3,Dagmersellen,LU,3,NA,1,7.99012865430426,47.2137719336746,Chrisch(t)-,1,Dagmersellen (LU)
1143,LU4,Schötz,LU,4,NA,1,7.98969327669852,47.1714927682271,Chrisch(t)-,1,Schötz (LU)
1104,LU5,Triengen,LU,5,NA,1,8.0788510367051,47.2358032540018,Chrisch(t)-,1,Triengen (LU)
1103,LU6,Sursee,LU,6,NA,1,8.10843929078811,47.1726625072481,Chrisch(t)-,1,Sursee (LU)
1081,LU7,Beromünster-Gunzwil,LU,7,NA,1,8.19204051153565,47.2072309789312,Chrisch(t)-,1,Beromünster-Gunzwil (LU)
1092,LU8,Neudorf,LU,8,NA,1,8.21010559769849,47.1783234977547,Chrisch(t)-,1,Neudorf (LU)
1021,LU9,Aesch,LU,9,NA,1,8.24295838694931,47.257265240163,Chrisch(t)-,1,Aesch (LU)
1030,LU10,Hitzkirch,LU,10,NA,1,8.26494661236564,47.2265227560328,Chrisch(t)-,1,Hitzkirch (LU)
1032,LU11,Kleinwangen,LU,11,NA,1,8.29616198452333,47.196606933047,Chrisch(t)-,1,Kleinwangen (LU)
1150,LU12,Zell,LU,12,NA,1,7.92344969423249,47.1403044996858,Chrisch(t)-,1,Zell (LU)
1151,LU13,Willisau,LU,13,NA,1,7.99182984123462,47.1229035290303,Chrisch(t)-,1,Willisau (LU)
1086,LU14,Grosswangen,LU,14,NA,1,8.04995346710173,47.1343044396441,Chrisch(t)-,1,Grosswangen (LU)
1098,LU15,Ruswil,LU,15,NA,1,8.1271163610741,47.0861881510067,Chrisch(t)-,1,Ruswil (LU)
1094,LU16,Nottwil,LU,16,NA,1,8.13831002420572,47.1364999403296,Chrisch(t)-,1,Nottwil (LU)
1102,LU17,Sempach,LU,17,NA,1,8.19235925891988,47.1361585308393,Chrisch(t)-,1,Sempach (LU)
1093,LU18,Neuenkirch,LU,18,NA,1,8.20502707577167,47.1000893310901,Chrisch(t)-,1,Neuenkirch (LU)
1040,LU19,Rothenburg,LU,19,NA,1,8.26956398514208,47.0987412954713,Chrisch(t)-,1,Rothenburg (LU)
1026,LU20,Eschenbach,LU,20,NA,1,8.32151745520278,47.1334403982965,Chrisch(t)-,1,Eschenbach (LU)
1135,LU21,Hofstatt,LU,21,NA,1,7.91631254095143,47.0791606443211,Chrisch(t)-,1,Hofstatt (LU)
1136,LU22,Menzberg,LU,22,NA,1,7.99889144202673,47.0419031419174,Chrisch(t)-,1,Menzberg (LU)
1107,LU23,Wolhusen,LU,23,NA,1,8.07411445662176,47.0595043834549,Chrisch(t)-,1,Wolhusen (LU)
1062,LU24,Malters,LU,24,NA,1,8.18571870266765,47.0381409223881,Chrisch(t)-,1,Malters (LU)
1061,LU25,Luzern,LU,25,NA,1,8.31101551513448,47.0552505567773,Chrisch(t)-,1,Luzern (LU)
1058,LU26,Horw,LU,26,NA,1,8.31176070118521,47.0201579269723,Chrisch(t)-,1,Horw (LU)
1054,LU27,Ebikon,LU,27,NA,1,8.34309087274272,47.083791667415,Chrisch(t)-,1,Ebikon (LU)
1069,LU28,Weggis,LU,28,NA,1,8.43567273059454,47.0335432120196,Chrisch(t)-,1,Weggis (LU)
1002,LU29,Entlebuch,LU,29,NA,1,8.06544894416219,46.9938782046281,Chrisch(t)-,1,Entlebuch (LU)
1008,LU30,Schüpfheim,LU,30,NA,1,8.0203174475458,46.9545314044517,Chrisch(t)-,1,Schüpfheim (LU)
1006,LU32,Marbach,LU,32,NA,1,7.89989370836321,46.8543183444001,Chrisch(t)-,1,Marbach (LU)
1004,LU33,Flühli,LU,33,NA,1,8.0169351340103,46.8843754932082,Chrisch(t)-,1,Flühli (LU)
3392,SG1,Kirchberg,SG,1,NA,1,9.04050680322523,47.4126897507634,Chrisch(t)-,1,Kirchberg (SG)
3425,SG2,Wil,SG,2,NA,1,9.04467570420214,47.4630152611819,Chrisch(t)-,1,Wil (SG)
3402,SG3,Flawil,SG,3,NA,1,9.18768282780519,47.4141547401225,Chrisch(t)-,1,Flawil (SG)
3422,SG4,Niederbüren,SG,4,NA,1,9.20534201412502,47.4669708551555,Chrisch(t)-,1,Niederbüren (SG)
3441,SG5,Andwil,SG,5,NA,1,9.27596068655108,47.4370784345785,Chrisch(t)-,1,Andwil (SG)
3444,SG6,Waldkirch,SG,6,NA,1,9.28639391017783,47.470203224766,Chrisch(t)-,1,Waldkirch (SG)
3203,SG7,St. Gallen,SG,7,NA,1,9.37416947163568,47.4390749046692,Chrisch(t)-,1,St. Gallen (SG)
3214,SG8,Mörschwil,SG,8,NA,1,9.42346061379419,47.4805294673715,Chrisch(t)-,1,Mörschwil (SG)
3215,SG9,Rorschach-Rorschacherberg,SG,9,NA,1,9.49539972781728,47.4873711254622,Chrisch(t)-,1,Rorschach-Rorschacherberg (SG)
3237,SG10,Thal,SG,10,NA,1,9.54466043391846,47.4909840517288,Chrisch(t)-,1,Thal (SG)
3235,SG11,Rheineck,SG,11,NA,1,9.59481679679142,47.4837613818528,Chrisch(t)-,1,Rheineck (SG)
3233,SG12,Berneck,SG,12,NA,1,9.61372201437626,47.426716676896,Chrisch(t)-,1,Berneck (SG)
3255,SG13,Rebstein,SG,13,NA,1,9.58484488240621,47.401160721443,Chrisch(t)-,1,Rebstein (SG)
3251,SG14,Altstätten,SG,14,NA,1,9.54157593156505,47.3794603041251,Chrisch(t)-,1,Altstätten (SG)
3234,SG15,Diepoldsau,SG,15,NA,1,9.65712248582708,47.3862968264046,Chrisch(t)-,1,Diepoldsau (SG)
3254,SG16,Oberriet,SG,16,NA,1,9.56575506480063,47.321425770551,Chrisch(t)-,1,Oberriet (SG)
3274,SG17,Sennwald,SG,17,NA,1,9.50523268264483,47.2622350705691,Chrisch(t)-,1,Sennwald (SG)
3274,SG18,Frümsen,SG,18,NA,1,9.47291207495551,47.246612713668,Chrisch(t)-,1,Frümsen (SG)
3394,SG19,Mosnang,SG,19,NA,1,9.04169447501879,47.3640885859893,Chrisch(t)-,1,Mosnang (SG)
3371,SG20,Brunnadern,SG,20,NA,1,9.13216945251063,47.3358043714362,Chrisch(t)-,1,Brunnadern (SG)
3406,SG21,Mogelsberg,SG,21,NA,1,9.13705498275969,47.3645245605157,Chrisch(t)-,1,Mogelsberg (SG)
3332,SG22,Eschenbach,SG,22,NA,1,8.91953505556073,47.2568551909732,Chrisch(t)-,1,Eschenbach (SG)
3331,SG24,Ricken,SG,24,NA,1,9.04533050663696,47.2650669479113,Chrisch(t)-,1,Ricken (SG)
3352,SG26,Ebnat-Kappel,SG,26,NA,1,9.12460276234353,47.2639343796722,Chrisch(t)-,1,Ebnat-Kappel (SG)
3372,SG27,Hemberg,SG,27,NA,1,9.17606510224919,47.3018603280703,Chrisch(t)-,1,Hemberg (SG)
3338,SG28,Schmerikon,SG,28,NA,1,8.94511910188412,47.2268323528659,Chrisch(t)-,1,Schmerikon (SG)
3312,SG29,Benken,SG,29,NA,1,9.00640796108055,47.1999214061085,Chrisch(t)-,1,Benken (SG)
3334,SG30,Gommiswald,SG,30,NA,1,9.02452358296181,47.232064460385,Chrisch(t)-,1,Gommiswald (SG)
3273,SG33,Grabs,SG,33,NA,1,9.44413582312219,47.1841267170401,Chrisch(t)-,1,Grabs (SG)
3315,SG34,Schänis,SG,34,NA,1,9.04749907430382,47.1615639966915,Chrisch(t)-,1,Schänis (SG)
3311,SG35,Amden,SG,35,NA,1,9.15135474268548,47.1501664171592,Chrisch(t)-,1,Amden (SG)
3295,SG36,Murg,SG,36,NA,1,9.21613608813278,47.1149899332189,Chrisch(t)-,1,Murg (SG)
3295,SG37,Oberterzen,SG,37,NA,1,9.25661061722892,47.1035586088203,Chrisch(t)-,1,Oberterzen (SG)
3298,SG38,Tscherlach,SG,38,NA,1,9.31403525405818,47.1251317501302,Chrisch(t)-,1,Tscherlach (SG)
3292,SG39,Flums,SG,39,NA,1,9.34322166398267,47.0931565937847,Chrisch(t)-,1,Flums (SG)
3293,SG41,Mels,SG,41,NA,1,9.42060187733497,47.0477525986815,Chrisch(t)-,1,Mels (SG)
3275,SG42,Sevelen,SG,42,NA,1,9.48535842145777,47.1231078769771,Chrisch(t)-,1,Sevelen (SG)
3276,SG43,Azmoos,SG,43,NA,1,9.48557558224514,47.094307137208,Chrisch(t)-,1,Azmoos (SG)
2974,SH2,Wilchingen,SH,2,NA,1,8.46891955960072,47.668376194043,Chrisch(t)-,1,Wilchingen (SH)
2952,SH3,Schleitheim,SH,3,NA,1,8.4878664606084,47.7509612168029,Chrisch(t)-,1,Schleitheim (SH)
2953,SH4,Siblingen,SH,4,NA,1,8.52182014824723,47.7155694279346,Chrisch(t)-,1,Siblingen (SH)
2934,SH5,Hemmental,SH,5,NA,1,8.58090163936482,47.7356928207614,Chrisch(t)-,1,Hemmental (SH)
2936,SH6,Merishausen,SH,6,NA,1,8.60949399775717,47.7623938323904,Chrisch(t)-,1,Merishausen (SH)
2939,SH7,Schaffhausen,SH,7,NA,1,8.63343436998235,47.7000834268351,Chrisch(t)-,1,Schaffhausen (SH)
2917,SH8,Lohn,SH,8,NA,1,8.67207662080346,47.7572496585978,Chrisch(t)-,1,Lohn (SH)
2963,SH9,Ramsen,SH,9,NA,1,8.81089226887801,47.7089182047577,Chrisch(t)-,1,Ramsen (SH)
2964,SH10,Stein,SH,10,NA,1,8.86026683706691,47.6615464760967,Chrisch(t)-,1,Stein (SH)
2938,SH11,Rüdlingen,SH,11,NA,1,8.56431878633526,47.5829333055148,Chrisch(t)-,1,Rüdlingen (SH)
2611,SO6,Bärschwil,SO,6,NA,1,7.47401890325449,47.3833003448922,Chrisch(t)-,1,Bärschwil (SO)
2528,SO11,Rickenbach,SO,11,NA,1,7.85643453411791,47.3384748547907,Chrisch(t)-,1,Rickenbach (SO)
2581,SO12,Olten,SO,12,NA,1,7.89891219550714,47.3536059763565,Chrisch(t)-,1,Olten (SO)
2423,SO15,Gänsbrunnen,SO,15,NA,1,7.46865531399601,47.2627624568375,Chrisch(t)-,1,Gänsbrunnen (SO)
2547,SO16,Günsberg,SO,16,NA,1,7.57832647547723,47.2590842984894,Chrisch(t)-,1,Günsberg (SO)
2401,SO20,Egerkingen,SO,20,NA,1,7.79413687779959,47.3233907581055,Chrisch(t)-,1,Egerkingen (SO)
2408,SO21,Wolfwil,SO,21,NA,1,7.7990768139316,47.2712007775019,Chrisch(t)-,1,Wolfwil (SO)
2601,SO25,Solothurn,SO,25,NA,1,7.53067608406592,47.2114546477745,Chrisch(t)-,1,Solothurn (SO)
2525,SO26,Kriegstetten,SO,26,NA,1,7.59790405983196,47.1771977272429,Chrisch(t)-,1,Kriegstetten (SO)
2516,SO27,Deitingen,SO,27,NA,1,7.62178392834715,47.215844330234,Chrisch(t)-,1,Deitingen (SO)
2511,SO28,Aeschi,SO,28,NA,1,7.66388959450489,47.1815858680368,Chrisch(t)-,1,Aeschi (SO)
1323,SZ1,Wollerau-Freienbach,SZ,1,NA,1,8.72119629011502,47.1971547634695,Chrisch(t)-,1,Wollerau-Freienbach (SZ)
1321,SZ2,Feusisberg,SZ,2,NA,1,8.74871054285158,47.1887475671257,Chrisch(t)-,1,Feusisberg (SZ)
1342,SZ3,Galgenen,SZ,3,NA,1,8.87527650142911,47.1836382376226,Chrisch(t)-,1,Galgenen (SZ)
1346,SZ4,Schübelbach,SZ,4,NA,1,8.9291405074664,47.1748554239544,Chrisch(t)-,1,Schübelbach (SZ)
1347,SZ5,Tuggen,SZ,5,NA,1,8.94448547935357,47.2043471704005,Chrisch(t)-,1,Tuggen (SZ)
1370,SZ6,Rothenthurm,SZ,6,NA,1,8.67684266727218,47.1058710656857,Chrisch(t)-,1,Rothenthurm (SZ)
1301,SZ7,Einsiedeln,SZ,7,NA,1,8.75514373110966,47.1283934126528,Chrisch(t)-,1,Einsiedeln (SZ)
1343,SZ8,Innerthal,SZ,8,NA,1,8.92067631311981,47.1074835186604,Chrisch(t)-,1,Innerthal (SZ)
1331,SZ9,Küssnacht,SZ,9,NA,1,8.4418774452363,47.0838712127673,Chrisch(t)-,1,Küssnacht (SZ)
1362,SZ10,Arth,SZ,10,NA,1,8.53877487243728,47.0559933854614,Chrisch(t)-,1,Arth (SZ)
1311,SZ11,Gersau,SZ,11,NA,1,8.52696715750526,46.9931269874897,Chrisch(t)-,1,Gersau (SZ)
1365,SZ12,Lauerz,SZ,12,NA,1,8.58049149790541,47.036692306078,Chrisch(t)-,1,Lauerz (SZ)
1372,SZ13,Schwyz,SZ,13,NA,1,8.65518163397545,47.022429094607,Chrisch(t)-,1,Schwyz (SZ)
1361,SZ14,Alpthal,SZ,14,NA,1,8.71688807426301,47.0721429553275,Chrisch(t)-,1,Alpthal (SZ)
1367,SZ15,Muotathal,SZ,15,NA,1,8.75930204738988,46.9762905772403,Chrisch(t)-,1,Muotathal (SZ)
1368,SZ16,Oberiberg,SZ,16,NA,1,8.78326529813014,47.0407937897918,Chrisch(t)-,1,Oberiberg (SZ)
4536,TG1,Basadingen,TG,1,NA,1,8.74862259376762,47.67005614999,Chrisch(t)-,1,Basadingen (TG)
4601,TG2,Oberneunforn,TG,2,NA,1,8.76969802769113,47.6077454799736,Chrisch(t)-,1,Oberneunforn (TG)
4821,TG3,Hüttwilen,TG,3,NA,1,8.87214336510251,47.6083239319931,Chrisch(t)-,1,Hüttwilen (TG)
4826,TG4,Mammern,TG,4,NA,1,8.91713052546458,47.64734227419,Chrisch(t)-,1,Mammern (TG)
4841,TG5,Pfyn,TG,5,NA,1,8.9556388245753,47.597366069678,Chrisch(t)-,1,Pfyn (TG)
4816,TG6,Homburg,TG,6,NA,1,9.00863447483893,47.6353451559398,Chrisch(t)-,1,Homburg (TG)
4951,TG7,Wigoltingen,TG,7,NA,1,9.03150215243325,47.5990478024048,Chrisch(t)-,1,Wigoltingen (TG)
4646,TG8,Ermatingen,TG,8,NA,1,9.08564337741824,47.6720627727994,Chrisch(t)-,1,Ermatingen (TG)
4946,TG9,Weinfelden,TG,9,NA,1,9.11033877472584,47.5682489082654,Chrisch(t)-,1,Weinfelden (TG)
4666,TG10,Neuwilen,TG,10,NA,1,9.14815520079938,47.6279756626829,Chrisch(t)-,1,Neuwilen (TG)
4901,TG11,Birwinken,TG,11,NA,1,9.19857123275119,47.5831371701197,Chrisch(t)-,1,Birwinken (TG)
4643,TG12,Bottighofen,TG,12,NA,1,9.20713469119866,47.6405868596793,Chrisch(t)-,1,Bottighofen (TG)
4426,TG13,Kesswil,TG,13,NA,1,9.31866357440509,47.5947475611243,Chrisch(t)-,1,Kesswil (TG)
4571,TG14,Gachnang,TG,14,NA,1,8.85433723149551,47.5392719411566,Chrisch(t)-,1,Gachnang (TG)
4566,TG15,Frauenfeld,TG,15,NA,1,8.89605132446713,47.5585466531329,Chrisch(t)-,1,Frauenfeld (TG)
4721,TG16,Balterswil,TG,16,NA,1,8.93962785772239,47.4545296750616,Chrisch(t)-,1,Balterswil (TG)
4606,TG17,Stettfurt,TG,17,NA,1,8.95246187752067,47.5326333002847,Chrisch(t)-,1,Stettfurt (TG)
4781,TG18,Wängi,TG,18,NA,1,8.97165393297649,47.5071903477496,Chrisch(t)-,1,Wängi (TG)
4726,TG19,Fischingen,TG,19,NA,1,8.9703376786066,47.4154404930405,Chrisch(t)-,1,Fischingen (TG)
4611,TG20,Lustdorf,TG,20,NA,1,8.98889276863603,47.5519439069086,Chrisch(t)-,1,Lustdorf (TG)
4711,TG21,Märwil,TG,21,NA,1,9.07888793498286,47.5399086781635,Chrisch(t)-,1,Märwil (TG)
4723,TG22,Braunau,TG,22,NA,1,9.07379633314649,47.5039932891932,Chrisch(t)-,1,Braunau (TG)
4506,TG23,Sulgen,TG,23,NA,1,9.18651671813047,47.5401339883044,Chrisch(t)-,1,Sulgen (TG)
4511,TG24,Sitterdorf,TG,24,NA,1,9.25048431760546,47.5067608204322,Chrisch(t)-,1,Sitterdorf (TG)
4461,TG25,Amriswil,TG,25,NA,1,9.29967869227616,47.5464686478767,Chrisch(t)-,1,Amriswil (TG)
4431,TG26,Roggwil,TG,26,NA,1,9.40091204974811,47.5169051976862,Chrisch(t)-,1,Roggwil (TG)
5304,TI1,Bosco Gurin,TI,1,NA,1,8.49266976444874,46.3177458076092,Chrisch(t)-,1,Bosco Gurin (TI)
1215,UR1,Seelisberg,UR,1,NA,1,8.58829436008451,46.9709353879135,Chrisch(t)-,1,Seelisberg (UR)
1211,UR2,Isenthal,UR,2,NA,1,8.56208402513399,46.9118138371004,Chrisch(t)-,1,Isenthal (UR)
1217,UR3,Sisikon,UR,3,NA,1,8.62333902107931,46.9507845808562,Chrisch(t)-,1,Sisikon (UR)
1201,UR4,Altdorf,UR,4,NA,1,8.64413665165392,46.8821876976638,Chrisch(t)-,1,Altdorf (UR)
1219,UR5,Unterschächen,UR,5,NA,1,8.7709908408726,46.8645851685493,Chrisch(t)-,1,Unterschächen (UR)
1206,UR6,Erstfeld,UR,6,NA,1,8.65198120594838,46.8227215057972,Chrisch(t)-,1,Erstfeld (UR)
1216,UR7,Silenen,UR,7,NA,1,8.67224842762854,46.7919128648771,Chrisch(t)-,1,Silenen (UR)
1209,UR8,Gurtnellen,UR,8,NA,1,8.63049231396861,46.7401704431486,Chrisch(t)-,1,Gurtnellen (UR)
1220,UR9,Meien-Dörfli,UR,9,NA,1,8.55559066125914,46.7256323816304,Chrisch(t)-,1,Meien-Dörfli (UR)
1208,UR10,Göscheneralp,UR,10,NA,1,8.50039808414884,46.6469822085465,Chrisch(t)-,1,Göscheneralp (UR)
1210,UR11,Hospental,UR,11,NA,1,8.56908343111313,46.6202285616643,Chrisch(t)-,1,Hospental (UR)
1507,UW1,Hergiswil,UW,1,NA,1,8.31256346115401,46.9886633034679,Chrisch(t)-,1,Hergiswil (UW)
1509,UW2,Stans-Oberdorf,UW,2,NA,1,8.36726375981871,46.9585438868649,Chrisch(t)-,1,Stans-Oberdorf (UW)
1511,UW3,Wolfenschiessen,UW,3,NA,1,8.39663264274182,46.9106183871891,Chrisch(t)-,1,Wolfenschiessen (UW)
1502,UW4,Buochs,UW,4,NA,1,8.42144470751291,46.9751862949963,Chrisch(t)-,1,Buochs (UW)
1504,UW5,Emmetten,UW,5,NA,1,8.51968734879277,46.9581072971279,Chrisch(t)-,1,Emmetten (UW)
1401,UW6,Alpnach,UW,6,NA,1,8.27502544600457,46.9421601383621,Chrisch(t)-,1,Alpnach (UW)
1407,UW7,Sarnen-Kägiswil,UW,7,NA,1,8.24545352122236,46.8973882766082,Chrisch(t)-,1,Sarnen-Kägiswil (UW)
1406,UW8,Sachseln,UW,8,NA,1,8.23980205962033,46.8704375039314,Chrisch(t)-,1,Sachseln (UW)
1403,UW9,Giswil,UW,9,NA,1,8.1882178796763,46.8401978302231,Chrisch(t)-,1,Giswil (UW)
1405,UW10,Lungern,UW,10,NA,1,8.15865401288412,46.7864068061565,Chrisch(t)-,1,Lungern (UW)
1404,UW11,Melchtal,UW,11,NA,1,8.28910785304949,46.8358934522427,Chrisch(t)-,1,Melchtal (UW)
1402,UW12,Engelberg,UW,12,NA,1,8.40556532176359,46.823271888761,Chrisch(t)-,1,Engelberg (UW)
6113,WS1,Salgesch,WS,1,NA,1,7.57071603109592,46.312673866409,Chrisch(t)-,1,Salgesch (VS)
6114,WS5,Turtmann,WS,5,NA,1,7.70439203391506,46.3016438634795,Chrisch(t)-,1,Turtmann (VS)
6195,WS6,Ferden,WS,6,NA,1,7.76076204630733,46.3950643102071,Chrisch(t)-,1,Ferden (VS)
6192,WS7,Blatten,WS,7,NA,1,7.82076550579117,46.4218687636596,Chrisch(t)-,1,Blatten (VS)
6194,WS8,Eischoll,WS,8,NA,1,7.78093844521229,46.2951410189679,Chrisch(t)-,1,Eischoll (VS)
6193,WS10,Bürchen,WS,10,NA,1,7.83657102124796,46.2706680553495,Chrisch(t)-,1,Bürchen (VS)
6300,WS20,Zermatt,WS,20,NA,1,7.74822996319485,46.0208357178502,Chrisch(t)-,1,Zermatt (VS)
6291,WS21,Saas-Grund,WS,21,NA,1,7.93901724910164,46.1245130811051,Chrisch(t)-,1,Saas-Grund (VS)
6009,WS25,Simplon Dorf,WS,25,NA,1,8.05758121586864,46.1968005689447,Chrisch(t)-,1,Simplon Dorf (VS)
6171,WS27,Betten,WS,27,NA,1,8.07133950555744,46.3775637434993,Chrisch(t)-,1,Betten (VS)
6064,WS31,Niederwald,WS,31,NA,1,8.1904587870474,46.4371174182357,Chrisch(t)-,1,Niederwald (VS)
6075,WS32,Reckingen,WS,32,NA,1,8.24431784709012,46.470937242408,Chrisch(t)-,1,Reckingen (VS)
6074,WS33,Geschinen,WS,33,NA,1,8.28374421282787,46.4940435260677,Chrisch(t)-,1,Geschinen (VS)
6066,WS34,Oberwald,WS,34,NA,1,8.35087355504961,46.5349119969137,Chrisch(t)-,1,Oberwald (VS)
1703,ZG1,Hünenberg,ZG,1,NA,1,8.42775071576386,47.1748597336025,Chrisch(t)-,1,Hünenberg (ZG)
1707,ZG2,Risch,ZG,2,NA,1,8.46659994284514,47.1367333944674,Chrisch(t)-,1,Risch (ZG)
1708,ZG3,Steinhausen,ZG,3,NA,1,8.48626940165934,47.1986327267411,Chrisch(t)-,1,Steinhausen (ZG)
1701,ZG4,Baar,ZG,4,NA,1,8.5298024593841,47.1973286989649,Chrisch(t)-,1,Baar (ZG)
1711,ZG5,Zug,ZG,5,NA,1,8.51868167552506,47.1695439226245,Chrisch(t)-,1,Zug (ZG)
1710,ZG6,Walchwil,ZG,6,NA,1,8.51600439263381,47.1020933452145,Chrisch(t)-,1,Walchwil (ZG)
1706,ZG7,Oberägeri,ZG,7,NA,1,8.57880030882077,47.1428731393327,Chrisch(t)-,1,Oberägeri (ZG)
1704,ZG8,Menzingen,ZG,8,NA,1,8.5914789966495,47.1805334045744,Chrisch(t)-,1,Menzingen (ZG)
70,ZH1,Wasterkingen,ZH,1,NA,1,8.47408339866068,47.5918699963875,Chrisch(t)-,1,Wasterkingen (ZH)
55,ZH2,Eglisau,ZH,2,NA,1,8.52460534539766,47.5914079902741,Chrisch(t)-,1,Eglisau (ZH)
67,ZH3,Rafz,ZH,3,NA,1,8.53836630518591,47.6137671361103,Chrisch(t)-,1,Rafz (ZH)
28,ZH4,Flaach,ZH,4,NA,1,8.60939529365318,47.5770895501229,Chrisch(t)-,1,Flaach (ZH)
34,ZH5,Uhwiesen,ZH,5,NA,1,8.6354484766111,47.6712774447574,Chrisch(t)-,1,Uhwiesen (ZH)
35,ZH6,Marthalen,ZH,6,NA,1,8.64908822527414,47.6270579278661,Chrisch(t)-,1,Marthalen (ZH)
33,ZH7,Kleinandelfingen,ZH,7,NA,1,8.68439550838053,47.6005966798155,Chrisch(t)-,1,Kleinandelfingen (ZH)
40,ZH8,Trüllikon,ZH,8,NA,1,8.69461877993748,47.63916806627,Chrisch(t)-,1,Trüllikon (ZH)
42,ZH9,Unterstammheim,ZH,9,NA,1,8.79182440871288,47.6407743041161,Chrisch(t)-,1,Unterstammheim (ZH)
218,ZH10,Ellikon,ZH,10,NA,1,8.8257760161216,47.5648068175579,Chrisch(t)-,1,Ellikon (ZH)
91,ZH11,Niederweningen,ZH,11,NA,1,8.37815673064274,47.5063301902184,Chrisch(t)-,1,Niederweningen (ZH)
102,ZH12,Weiach,ZH,12,NA,1,8.43887124929199,47.5579962197278,Chrisch(t)-,1,Weiach (ZH)
100,ZH13,Stadel,ZH,13,NA,1,8.46889030016269,47.5298469337094,Chrisch(t)-,1,Stadel (ZH)
89,ZH14,Niederglatt,ZH,14,NA,1,8.50533346707716,47.4926344949736,Chrisch(t)-,1,Niederglatt (ZH)
58,ZH15,Glattfelden,ZH,15,NA,1,8.50268399907087,47.5592271603939,Chrisch(t)-,1,Glattfelden (ZH)
53,ZH16,Bülach,ZH,16,NA,1,8.54174184485355,47.5201804047419,Chrisch(t)-,1,Bülach (ZH)
56,ZH17,Embrach,ZH,17,NA,1,8.59584517264706,47.5043594594255,Chrisch(t)-,1,Embrach (ZH)
223,ZH18,Neftenbach,ZH,18,NA,1,8.66812251731745,47.5297029894259,Chrisch(t)-,1,Neftenbach (ZH)
31,ZH19,Henggart,ZH,19,NA,1,8.68353042931376,47.5637230431553,Chrisch(t)-,1,Henggart (ZH)
227,ZH20,Seuzach,ZH,20,NA,1,8.73338755941337,47.5370883594181,Chrisch(t)-,1,Seuzach (ZH)
230,ZH21,Winterthur,ZH,21,NA,1,8.72983516807312,47.5002438946212,Chrisch(t)-,1,Winterthur (ZH)
212,ZH22,Gundetswil-Stegen,ZH,22,NA,1,8.81551843732089,47.5280446956559,Chrisch(t)-,1,Gundetswil-Stegen (ZH)
217,ZH23,Elgg,ZH,23,NA,1,8.86899112506617,47.4914109646394,Chrisch(t)-,1,Elgg (ZH)
94,ZH24,Otelfingen,ZH,24,NA,1,8.38800523318572,47.4630706404935,Chrisch(t)-,1,Otelfingen (ZH)
251,ZH25,Weiningen,ZH,25,NA,1,8.43630355505654,47.4212833127008,Chrisch(t)-,1,Weiningen (ZH)
95,ZH26,Regensberg,ZH,26,NA,1,8.44013810091704,47.4842210697167,Chrisch(t)-,1,Regensberg (ZH)
97,ZH27,Rümlang,ZH,27,NA,1,8.53238739044561,47.4527999937523,Chrisch(t)-,1,Rümlang (ZH)
52,ZH28,Bassersdorf,ZH,28,NA,1,8.63037204094852,47.4455347196274,Chrisch(t)-,1,Bassersdorf (ZH)
213,ZH29,Brütten,ZH,29,NA,1,8.67479287082582,47.4738563254062,Chrisch(t)-,1,Brütten (ZH)
174,ZH30,Unterillnau,ZH,30,NA,1,8.71203483645987,47.4221735331972,Chrisch(t)-,1,Unterillnau (ZH)
180,ZH31,Weisslingen,ZH,31,NA,1,8.76533504897194,47.4332695086097,Chrisch(t)-,1,Weisslingen (ZH)
226,ZH32,Schlatt,ZH,32,NA,1,8.82859547237513,47.469412040063,Chrisch(t)-,1,Schlatt (ZH)
228,ZH33,Turbenthal,ZH,33,NA,1,8.84635547698932,47.4386090359947,Chrisch(t)-,1,Turbenthal (ZH)
250,ZH34,Urdorf,ZH,34,NA,1,8.42500163716897,47.3835972166606,Chrisch(t)-,1,Urdorf (ZH)
242,ZH35,Birmensdorf,ZH,35,NA,1,8.43906290973934,47.3564880895563,Chrisch(t)-,1,Birmensdorf (ZH)
13,ZH36,Stallikon,ZH,36,NA,1,8.49142320708932,47.3263350366403,Chrisch(t)-,1,Stallikon (ZH)
261,ZH37,Zürich,ZH,37,NA,1,8.53997596492319,47.3708633556177,Chrisch(t)-,1,Zürich (ZH)
261,ZH38,Zürich-Schwamendingen,ZH,38,NA,1,8.57382292882034,47.4056209762646,Chrisch(t)-,1,Zürich-Schwamendingen (ZH)
193,ZH39,Fällanden,ZH,39,NA,1,8.64063898972326,47.371658878508,Chrisch(t)-,1,Fällanden (ZH)
195,ZH40,Maur,ZH,40,NA,1,8.67040483666548,47.3416568403838,Chrisch(t)-,1,Maur (ZH)
199,ZH41,Volketswil,ZH,41,NA,1,8.69538894211184,47.390868311955,Chrisch(t)-,1,Volketswil (ZH)
198,ZH42,Uster-Nänikon,ZH,42,NA,1,8.71958048914662,47.3501181888353,Chrisch(t)-,1,Uster-Nänikon (ZH)
178,ZH43,Russikon,ZH,43,NA,1,8.77766241668884,47.3962416355866,Chrisch(t)-,1,Russikon (ZH)
177,ZH44,Pfäffikon-Irgenhausen,ZH,44,NA,1,8.78618359367178,47.3664536592948,Chrisch(t)-,1,Pfäffikon-Irgenhausen (ZH)
111,ZH45,Bäretswil,ZH,45,NA,1,8.85825040905593,47.3376998594253,Chrisch(t)-,1,Bäretswil (ZH)
171,ZH46,Bauma-Saland,ZH,46,NA,1,8.87894694404282,47.3689325698248,Chrisch(t)-,1,Bauma-Saland (ZH)
179,ZH47,Sternenberg,ZH,47,NA,1,8.91651359324298,47.3864517064739,Chrisch(t)-,1,Sternenberg (ZH)
114,ZH48,Steg,ZH,48,NA,1,8.94088871453093,47.3582466132466,Chrisch(t)-,1,Steg (ZH)
5,ZH49,Hedingen,ZH,49,NA,1,8.44988422578297,47.2988181177642,Chrisch(t)-,1,Hedingen (ZH)
9,ZH50,Mettmenstetten,ZH,50,NA,1,8.46471367062554,47.2447089443336,Chrisch(t)-,1,Mettmenstetten (ZH)
1,ZH51,Aeugst,ZH,51,NA,1,8.48764553722766,47.2687928610631,Chrisch(t)-,1,Aeugst (ZH)
6,ZH52,Kappel,ZH,52,NA,1,8.52780418143279,47.2288357437194,Chrisch(t)-,1,Kappel (ZH)
136,ZH53,Langnau,ZH,53,NA,1,8.54227195868444,47.2898743761565,Chrisch(t)-,1,Langnau (ZH)
135,ZH54,Kilchberg,ZH,54,NA,1,8.5428672908179,47.3186571876994,Chrisch(t)-,1,Kilchberg (ZH)
133,ZH55,Horgen,ZH,55,NA,1,8.59981301870202,47.2605203053052,Chrisch(t)-,1,Horgen (ZH)
142,ZH56,Wädenswil,ZH,56,NA,1,8.6731161000332,47.2300690919608,Chrisch(t)-,1,Wädenswil (ZH)
134,ZH57,Hütten,ZH,57,NA,1,8.66263670760666,47.1761997924067,Chrisch(t)-,1,Hütten (ZH)
154,ZH58,Küsnacht,ZH,58,NA,1,8.58519359748087,47.3182443657386,Chrisch(t)-,1,Küsnacht (ZH)
156,ZH59,Meilen,ZH,59,NA,1,8.64630049258197,47.2708385860919,Chrisch(t)-,1,Meilen (ZH)
158,ZH60,Stäfa,ZH,60,NA,1,8.72095508624823,47.2421420734956,Chrisch(t)-,1,Stäfa (ZH)
192,ZH61,Egg-Esslingen,ZH,61,NA,1,8.69196982192455,47.3018395665552,Chrisch(t)-,1,Egg-Esslingen (ZH)
157,ZH62,Oetwil,ZH,62,NA,1,8.72166786172006,47.2718237011062,Chrisch(t)-,1,Oetwil (ZH)
115,ZH63,Grüt,ZH,63,NA,1,8.75693705226707,47.3083127062048,Chrisch(t)-,1,Grüt (ZH)
112,ZH64,Bubikon,ZH,64,NA,1,8.81945684110933,47.2706937253047,Chrisch(t)-,1,Bubikon (ZH)
117,ZH65,Hinwil,ZH,65,NA,1,8.84671570372591,47.3018534757895,Chrisch(t)-,1,Hinwil (ZH)
120,ZH66,Wald,ZH,66,NA,1,8.91614412114154,47.2775922890332,Chrisch(t)-,1,Wald (ZH)
6109,WS2,Inden,WS,2,NA,1,7.61886445266278,46.3458956836261,Chrischindli,1,Inden (VS)
6101,WS3,Agarn,WS,3,NA,1,7.66543111328568,46.2972299979404,Chrischindli,1,Agarn (VS)
6117,WS4,Feschel,WS,4,NA,1,7.6668494868956,46.3260167027121,Chrischindli,1,Feschel (VS)
6198,WS9,Niedergesteln,WS,9,NA,1,7.78236120391907,46.3149296333256,Chrischindli,1,Niedergesteln (VS)
6191,WS11,Ausserberg,WS,11,NA,1,7.85248051724769,46.3155951536911,Chrischindli,1,Ausserberg (VS)
6297,WS12,Visp,WS,12,NA,1,7.88476336850305,46.2938803216676,Chrischindli,1,Visp (VS)
6298,WS13,Visperterminen,WS,13,NA,1,7.90393931559015,46.2596151980607,Chrischindli,1,Visperterminen (VS)
6294,WS15,Staldenried,WS,15,NA,1,7.88295169150554,46.2309096414176,Chrischindli,1,Staldenried (VS)
6285,WS16,Grächen,WS,16,NA,1,7.83991313504291,46.1959829045734,Chrischindli,1,Grächen (VS)
6292,WS17,St. Niklaus,WS,17,NA,1,7.80351154121214,46.1772129440011,Chrischindli,1,St. Niklaus (VS)
6287,WS18,Randa,WS,18,NA,1,7.78619995405358,46.1025947221021,Chrischindli,1,Randa (VS)
6295,WS19,Täsch,WS,19,NA,1,7.77952019423533,46.0684277172798,Chrischindli,1,Täsch (VS)
6006,WS22,Mund,WS,22,NA,1,7.94338425744199,46.3170262764053,Chrischindli,1,Mund (VS)
6002,WS23,Gamsen,WS,23,NA,1,7.97171148528487,46.2926049614419,Chrischindli,1,Gamsen (VS)
6008,WS24,Brig-Ried,WS,24,NA,1,8.01739375348365,46.316672533712,Chrischindli,1,Brig-Ried (VS)
6179,WS26,Mörel,WS,26,NA,1,8.04641080986312,46.3570069967238,Chrischindli,1,Mörel (VS)
6061,WS28,Lax,WS,28,NA,1,8.12089184005213,46.3898723993941,Chrischindli,1,Lax (VS)
6056,WS29,Ernen,WS,29,NA,1,8.14572328347565,46.3996171334901,Chrischindli,1,Ernen (VS)
4323,AG16,Zurzach,AG,16,cnt_chrischt,2,8.29716279237623,47.5879170957005,Mehr als eine Variante,1,Zurzach (AG)
4008,AG24,Küttigen,AG,24,cnt_wienacht,2,8.04921739710415,47.4167782591351,Mehr als eine Variante,1,Küttigen (AG)
2886,BA16,Hölstein,BA,16,cnt_wienacht,2,7.77096133252808,47.4260074494039,Mehr als eine Variante,1,Hölstein (BA)
2787,BE3,Laufen,BE,3,cnt_wienacht,2,7.5018774903766,47.421968308736,Mehr als eine Variante,1,Laufen (BE)
351,BE47,Bern,BE,47,cnt_wienacht,2,7.44877787456672,46.939810427281,Mehr als eine Variante,1,Bern (BE)
573,BE83,Brienz,BE,83,cnt_chrischt,2,8.0325932630111,46.7574420911254,Mehr als eine Variante,1,Brienz (BE)
794,BE91,Zweisimmen,BE,91,cnt_wiene,2,7.38220913511371,46.5466493250744,Mehr als eine Variante,1,Zweisimmen (BE)
3333,SG23,Goldingen,SG,23,cnt_chrischt,2,8.96864598732439,47.2643111280505,Mehr als eine Variante,1,Goldingen (SG)
2615,SO7,Erschwil,SO,7,cnt_wienacht,2,7.54287079628488,47.373364401702,Mehr als eine Variante,1,Erschwil (SO)
2428,SO10,Mümliswil,SO,10,cnt_chrischt,2,7.70294670239185,47.3425256539652,Mehr als eine Variante,1,Mümliswil (SO)
2424,SO17,Herbetswil,SO,17,cnt_wienacht,2,7.59297259886314,47.2977468259864,Mehr als eine Variante,1,Herbetswil (SO)
2407,SO19,Oensingen,SO,19,cnt_wienacht,2,7.71856406237117,47.2921138749525,Mehr als eine Variante,1,Oensingen (SO)
2543,SO23,Bettlach,SO,23,cnt_wienacht,2,7.42506325021509,47.2042931860228,Mehr als eine Variante,1,Bettlach (SO)
4132,AG55,Birrwil,AG,55,cnt_chrischt,2,8.19719962040172,47.2917602337923,Mehr als eine Variante,1,Birrwil (AG)
3357,SG32,Wildhaus,SG,32,cnt_chrischt,2,9.35247368146663,47.2045848382997,Mehr als eine Variante,1,Wildhaus (SG)
6296,WS14,Törbel,WS,14,cnt_chrischt,2,7.85190007752387,46.2391243638932,Mehr als eine Variante,1,Törbel (VS)
`,
  },
  {
    name: 'Flächenkarte, Welt',
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
        '#ffeda0',
      ],
      features: {
        url: 'https://cdn.repub.ch/s3/republik-assets/assets/geo/world-atlas-110m-without-antarctic.json',
        object: 'countries',
      },
      missingDataLegend: 'Nicht untersucht',
      label: 'label',
      legendTitle: 'Medienfreiheit',
      colorLegendPosition: 'left',
      colorLegendSize: 0.17,
      colorLegendMinWidth: 90,
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
`,
  },
  {
    name: 'Flächenkarte, Schweiz mit Kantonen',
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
        'rgb(24,100,170)',
      ],
      features: {
        url: 'https://cdn.repub.ch/s3/republik-assets/assets/geo/epsg2056-projected-ch-cantons-wo-lakes.json',
        object: 'cantons',
      },
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
`,
  },
  {
    name: 'Hemicycle',
    screenshot: '/static/charts/hemicycle.png',
    config: {
      type: 'Hemicycle',
      unit: 'Sitze',
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
`,
  },
  {
    name: 'Tabelle',
    screenshot: '/static/charts/table.png',
    config: {
      type: 'Table',
      numberFormat: 's',
      tableColumns: [
        {
          column: 'Indikator',
          type: 'string',
        },
        {
          column: 'Afghanistan',
          type: 'number',
          width: '170',
        },
        {
          column: 'Schweiz',
          type: 'number',
          width: '170',
        },
      ],
    },
    values: `
Indikator,Afghanistan,Schweiz
Gesamtbevölkerung,38,8.6
"BNE pro Kopf (USD, kaufkraftbereinigt)",2229,69394
"Kindersterblichkeit (pro 1000 Kindern unter 5 Jahren)",62.3,4.1
"Jahre in der Schule (Mittelwert)",3.9,13.4`,
  },
]
