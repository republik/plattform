Vertical bars are a nice line chart alternative for change over time of one (stacked) series.

## Limitations

One very physical limitation is the width of a (small) mobile screen: 320px. If one accounts for the whitespace needs of the chart itself, we are left with around 250px of usable space for our bars. This translates to **250 data points** along the X-axis.

More than that and the calculated width of the bar ends up at 0, which isn't very useful at all.

## Examples

```react
<div>
  <ChartTitle>Entwicklung der Treibhausgas-Emissionen in Deutschland</ChartTitle>
  <ChartLead>in Millionen Tonnen CO<Sub>2eq</Sub> pro Jahr</ChartLead>
  <CsvChart
    config={{
      "type": "TimeBar",
      "color": "gas",
      "unit": "Tonnen",
      "numberFormat": ".3s",
      "xAnnotations": [
        {"x1": "2008","x2": "2012","value": 973619338.97,"unit": "Tonnen","label": "Kyoto-Protokoll"},
        {"x": "2020","value": 748700000,"label": "Ziel 2020","ghost": true},
        {"x": "2050","value": 249600000,"label": "Ziel 2050","valuePrefix": "max: ","ghost": true}
      ],
      "padding": 18
    }}
    values={`
gas,year,value
Kohlendioxid*,1990,1052246806.1130
Kohlendioxid*,1991,1014121953.7247
Kohlendioxid*,1992,965793227.3770
Kohlendioxid*,1993,955980155.8321
Kohlendioxid*,1994,939209708.4357
Kohlendioxid*,1995,938150071.2735
Kohlendioxid*,1996,958370643.2807
Kohlendioxid*,1997,930770376.0923
Kohlendioxid*,1998,922780329.6172
Kohlendioxid*,1999,895338499.5818
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
Methan,1990,120293326.0860
Methan,1991,114392457.3062
Methan,1992,110722823.0536
Methan,1993,111247866.7186
Methan,1994,107296030.7472
Methan,1995,104959814.6797
Methan,1996,102326613.3748
Methan,1997,97972851.9325
Methan,1998,92695969.3725
Methan,1999,92058451.2486
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
Lachgas,1990,64989039.2263
Lachgas,1991,62497045.7520
Lachgas,1992,63475500.4851
Lachgas,1993,60694281.7807
Lachgas,1994,61553587.1917
Lachgas,1995,60968470.3116
Lachgas,1996,62238353.4319
Lachgas,1997,59358453.0482
Lachgas,1998,46474177.4194
Lachgas,1999,43053267.0064
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
HFKW,1990,5891001.7524
HFKW,1991,5415186.8545
HFKW,1992,5637947.8589
HFKW,1993,7832793.2629
HFKW,1994,8010480.1147
HFKW,1995,8217491.3907
HFKW,1996,7528366.2502
HFKW,1997,8131246.9523
HFKW,1998,8709893.0225
HFKW,1999,8833679.1592
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
FKW,1990,3060415.7144
FKW,1991,2655049.3470
FKW,1992,2407975.3730
FKW,1993,2257644.5823
FKW,1994,1920015.0099
FKW,1995,2087350.5281
FKW,1996,2043182.8949
FKW,1997,1655509.8357
FKW,1998,1783925.2892
FKW,1999,1487057.1795
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
Schwefelhexafluorid,1990,4427998.1318
Schwefelhexafluorid,1991,4745878.7692
Schwefelhexafluorid,1992,5237807.1315
Schwefelhexafluorid,1993,5973591.3745
Schwefelhexafluorid,1994,6249227.8687
Schwefelhexafluorid,1995,6467149.5242
Schwefelhexafluorid,1996,6162492.5163
Schwefelhexafluorid,1997,6108844.1183
Schwefelhexafluorid,1998,5888914.8671
Schwefelhexafluorid,1999,4289752.1891
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
Stickstofftrifluorid,1990,6880.0000
Stickstofftrifluorid,1991,6880.0000
Stickstofftrifluorid,1992,6880.0000
Stickstofftrifluorid,1993,6880.0000
Stickstofftrifluorid,1994,6880.0000
Stickstofftrifluorid,1995,5289.7167
Stickstofftrifluorid,1996,7221.1333
Stickstofftrifluorid,1997,7851.8000
Stickstofftrifluorid,1998,7583.7667
Stickstofftrifluorid,1999,6685.0667
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
    `.trim()} />
  <ChartLegend>
    *ohne Kohlendioxid aus Landnutzung, Landnutzungsänderungen und Forstwirtschaft. Daten für 2016 sind vorläufig.<br />
    Quelle: Umweltbundesamt, Nationale Treibhausgas-Inventare 1990 bis 2015 (Stand 02/2017) und Schätzung für 2016 (Stand 03/2017).
    <br /><Editorial.A href='https://creativecommons.org/licenses/by-nc-nd/4.0/deed.de'>CC BY-NC-ND 4.0 Bundesregierung</Editorial.A>
  </ChartLegend>
</div>
```

## Custom Time Format

By default a four digit year column is expected. Use `x`, `timeParse` and `timeFormat` to customize.

```react
<div>
  <ChartTitle>Devisenanlagen der SNB</ChartTitle>
  <CsvChart
    config={{
      "type": "TimeBar",
      "numberFormat": ".3s",
      "unit": "",
      "x": "date",
      "xTicks": ["2001-01", "2007-01", "2012-01", "2018-01"],
      "xBandPadding": 0,
      "timeParse": "%Y-%m",
      "timeFormat": "%Y",
      "padding": 0
    }}
    values={`
date,bilanzposition,value
2000-06,Devisenanlagen,47874000000
2000-07,Devisenanlagen,46470000000
2000-08,Devisenanlagen,47759000000
2000-09,Devisenanlagen,48323000000
2000-10,Devisenanlagen,49783000000
2000-11,Devisenanlagen,50382000000
2000-12,Devisenanlagen,50926000000
2001-01,Devisenanlagen,50453000000
2001-02,Devisenanlagen,47352000000
2001-03,Devisenanlagen,49032000000
2001-04,Devisenanlagen,49456000000
2001-05,Devisenanlagen,51073000000
2001-06,Devisenanlagen,50968000000
2001-07,Devisenanlagen,50674000000
2001-08,Devisenanlagen,50591000000
2001-09,Devisenanlagen,51849000000
2001-10,Devisenanlagen,49403000000
2001-11,Devisenanlagen,49717000000
2001-12,Devisenanlagen,49751000000
2002-01,Devisenanlagen,50581000000
2002-02,Devisenanlagen,50729000000
2002-03,Devisenanlagen,50575000000
2002-04,Devisenanlagen,51131000000
2002-05,Devisenanlagen,48403000000
2002-06,Devisenanlagen,49941000000
2002-07,Devisenanlagen,49409000000
2002-08,Devisenanlagen,50973000000
2002-09,Devisenanlagen,49969000000
2002-10,Devisenanlagen,52867000000
2002-11,Devisenanlagen,53991000000
2002-12,Devisenanlagen,54414000000
2003-01,Devisenanlagen,52941000000
2003-02,Devisenanlagen,54014000000
2003-03,Devisenanlagen,53271000000
2003-04,Devisenanlagen,53578000000
2003-05,Devisenanlagen,52860000000
2003-06,Devisenanlagen,52869000000
2003-07,Devisenanlagen,56198000000
2003-08,Devisenanlagen,59287000000
2003-09,Devisenanlagen,58415000000
2003-10,Devisenanlagen,56167000000
2003-11,Devisenanlagen,56778000000
2003-12,Devisenanlagen,58225000000
2004-01,Devisenanlagen,56312000000
2004-02,Devisenanlagen,58662000000
2004-03,Devisenanlagen,58004000000
2004-04,Devisenanlagen,60402000000
2004-05,Devisenanlagen,60521000000
2004-06,Devisenanlagen,59985000000
2004-07,Devisenanlagen,57275000000
2004-08,Devisenanlagen,57173000000
2004-09,Devisenanlagen,58155000000
2004-10,Devisenanlagen,60798000000
2004-11,Devisenanlagen,60467000000
2004-12,Devisenanlagen,61766000000
2005-01,Devisenanlagen,60708000000
2005-02,Devisenanlagen,60454000000
2005-03,Devisenanlagen,61716000000
2005-04,Devisenanlagen,63786000000
2005-05,Devisenanlagen,62371000000
2005-06,Devisenanlagen,56530000000
2005-07,Devisenanlagen,48794000000
2005-08,Devisenanlagen,44452000000
2005-09,Devisenanlagen,44983000000
2005-10,Devisenanlagen,45584000000
2005-11,Devisenanlagen,45048000000
2005-12,Devisenanlagen,45429000000
2006-01,Devisenanlagen,46585000000
2006-02,Devisenanlagen,46068000000
2006-03,Devisenanlagen,45666000000
2006-04,Devisenanlagen,45553000000
2006-05,Devisenanlagen,44756000000
2006-06,Devisenanlagen,44539000000
2006-07,Devisenanlagen,43785000000
2006-08,Devisenanlagen,43614000000
2006-09,Devisenanlagen,43671000000
2006-10,Devisenanlagen,45400000000
2006-11,Devisenanlagen,45309000000
2006-12,Devisenanlagen,45558000000
2007-01,Devisenanlagen,45592000000
2007-02,Devisenanlagen,45285000000
2007-03,Devisenanlagen,44976000000
2007-04,Devisenanlagen,45398000000
2007-05,Devisenanlagen,44733000000
2007-06,Devisenanlagen,44909000000
2007-07,Devisenanlagen,46274000000
2007-08,Devisenanlagen,47095000000
2007-09,Devisenanlagen,48125000000
2007-10,Devisenanlagen,49487000000
2007-11,Devisenanlagen,49623000000
2007-12,Devisenanlagen,49202000000
2008-01,Devisenanlagen,50586000000
2008-02,Devisenanlagen,49729000000
2008-03,Devisenanlagen,49810000000
2008-04,Devisenanlagen,47296000000
2008-05,Devisenanlagen,46843000000
2008-06,Devisenanlagen,47495000000
2008-07,Devisenanlagen,47779000000
2008-08,Devisenanlagen,46725000000
2008-09,Devisenanlagen,47867000000
2008-10,Devisenanlagen,49665000000
2008-11,Devisenanlagen,49247000000
2008-12,Devisenanlagen,47939000000
2009-01,Devisenanlagen,47429000000
2009-02,Devisenanlagen,46452000000
2009-03,Devisenanlagen,46470000000
2009-04,Devisenanlagen,55846000000
2009-05,Devisenanlagen,55764000000
2009-06,Devisenanlagen,57285000000
2009-07,Devisenanlagen,81706000000
2009-08,Devisenanlagen,81485000000
2009-09,Devisenanlagen,81706000000
2009-10,Devisenanlagen,82105000000
2009-11,Devisenanlagen,90061000000
2009-12,Devisenanlagen,95203000000
2010-01,Devisenanlagen,94680000000
2010-02,Devisenanlagen,93895000000
2010-03,Devisenanlagen,108930000000
2010-04,Devisenanlagen,125089000000
2010-05,Devisenanlagen,153582000000
2010-06,Devisenanlagen,238786000000
2010-07,Devisenanlagen,226658000000
2010-08,Devisenanlagen,221375000000
2010-09,Devisenanlagen,219300000000
2010-10,Devisenanlagen,216823000000
2010-11,Devisenanlagen,213725000000
2010-12,Devisenanlagen,213775000000
2011-01,Devisenanlagen,203810000000
2011-02,Devisenanlagen,209903000000
2011-03,Devisenanlagen,208326000000
2011-04,Devisenanlagen,211918000000
2011-05,Devisenanlagen,208396000000
2011-06,Devisenanlagen,203385000000
2011-07,Devisenanlagen,196849000000
2011-08,Devisenanlagen,188735000000
2011-09,Devisenanlagen,280982000000
2011-10,Devisenanlagen,305281000000
2011-11,Devisenanlagen,261815000000
2011-12,Devisenanlagen,261950000000
2012-01,Devisenanlagen,257504000000
2012-02,Devisenanlagen,247484000000
2012-03,Devisenanlagen,241237000000
2012-04,Devisenanlagen,245499000000
2012-05,Devisenanlagen,247218000000
2012-06,Devisenanlagen,306148000000
2012-07,Devisenanlagen,365056000000
2012-08,Devisenanlagen,409189000000
2012-09,Devisenanlagen,421573000000
2012-10,Devisenanlagen,429918000000
2012-11,Devisenanlagen,426769000000
2012-12,Devisenanlagen,428253000000
2013-01,Devisenanlagen,432209000000
2013-02,Devisenanlagen,435883000000
2013-03,Devisenanlagen,439066000000
2013-04,Devisenanlagen,445585000000
2013-05,Devisenanlagen,444255000000
2013-06,Devisenanlagen,448349000000
2013-07,Devisenanlagen,438177000000
2013-08,Devisenanlagen,444349000000
2013-09,Devisenanlagen,443419000000
2013-10,Devisenanlagen,443071000000
2013-11,Devisenanlagen,446798000000
2013-12,Devisenanlagen,446420000000
2014-01,Devisenanlagen,443275000000
2014-02,Devisenanlagen,447978000000
2014-03,Devisenanlagen,442151000000
2014-04,Devisenanlagen,445480000000
2014-05,Devisenanlagen,447445000000
2014-06,Devisenanlagen,451952000000
2014-07,Devisenanlagen,457216000000
2014-08,Devisenanlagen,466618000000
2014-09,Devisenanlagen,471385000000
2014-10,Devisenanlagen,471452000000
2014-11,Devisenanlagen,475586000000
2014-12,Devisenanlagen,475728000000
2015-01,Devisenanlagen,510062000000
2015-02,Devisenanlagen,507856000000
2015-03,Devisenanlagen,519330000000
2015-04,Devisenanlagen,531911000000
2015-05,Devisenanlagen,536364000000
2015-06,Devisenanlagen,525479000000
2015-07,Devisenanlagen,529521000000
2015-08,Devisenanlagen,550670000000
2015-09,Devisenanlagen,557884000000
2015-10,Devisenanlagen,566182000000
2015-11,Devisenanlagen,571929000000
2015-12,Devisenanlagen,586971000000
2016-01,Devisenanlagen,593234000000
2016-02,Devisenanlagen,599759000000
2016-03,Devisenanlagen,589813000000
2016-04,Devisenanlagen,595375000000
2016-05,Devisenanlagen,616130000000
2016-06,Devisenanlagen,624227000000
2016-07,Devisenanlagen,635270000000
2016-08,Devisenanlagen,641050000000
2016-09,Devisenanlagen,656555000000
2016-10,Devisenanlagen,666228000000
2016-11,Devisenanlagen,664465000000
2016-12,Devisenanlagen,683306000000
2017-01,Devisenanlagen,696104000000
2017-02,Devisenanlagen,674520000000
2017-03,Devisenanlagen,702517000000
2017-04,Devisenanlagen,710532000000
2017-05,Devisenanlagen,730114000000
2017-06,Devisenanlagen,727977000000
2017-07,Devisenanlagen,724361000000
2017-08,Devisenanlagen,745274000000
2017-09,Devisenanlagen,747030000000
2017-10,Devisenanlagen,760966000000
2017-11,Devisenanlagen,782818000000
2017-12,Devisenanlagen,784239000000
2018-01,Devisenanlagen,790125000000
2018-02,Devisenanlagen,759715000000
    `.trim()} />
  <ChartLegend>
    Quelle: SNB
  </ChartLegend>
</div>
```

Note: You should specify the `xInterval` prop when you have gaps in your data. All [`d3-time`](https://github.com/d3/d3-time) intervals (year, month, weeks, days etc.) are supported.

## Diverging

```react
<div>
  <ChartTitle>Ordentliches Finanzierungsergebnis des Bundes</ChartTitle>
  <ChartLead>in Milliarden CHF</ChartLead>
  <CsvChart
    config={{
      "type": "TimeBar",
      "color": "type",
      "colorMap": {
        "Überschuss": "#90AA00",
        "Defizit": "#542785"
      },
      "xTicks": [1990, 2000, 2010, 2016],
      "yTicks": [10000000000, 5000000000, 0, -5000000000, -10000000000],
      "numberFormat": ".3s"
    }}
    values={`
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
    `.trim()} />
  <ChartLegend>
    Quelle: <Editorial.A href='https://www.efv.admin.ch/efv/de/home/finanzberichterstattung/bundeshaushalt_ueb/stat_kennz_bundeshh.html'>Eidgenössische Finanzverwaltung</Editorial.A>
  </ChartLegend>

</div>
```

### Diverging Stacks

```react
<CsvChart
  config={{
    "type": "TimeBar",
    "color": "typ",
    "colorRange": [
      "rgb(75,151,201)", "rgb(24,100,170)", "rgb(8,48,107)",
      "rgb(239,69,51)", "rgb(187,21,26)", "rgb(103,0,13)"
    ]
  }}
  values={`
year,typ,value
2003,A,3
2003,B,3
2003,C,3
2003,D,-3
2003,E,-3
2003,F,-3
2004,A,4
2004,B,4
2004,C,4
2004,D,-4
2004,E,-4
2004,F,-4
2005,A,6
2005,B,6
2005,C,6
2005,D,-6
2005,E,-6
2005,F,-6
2006,A,9
2006,B,9
2006,C,9
2006,D,-9
2006,E,-9
2006,F,-9
2007,A,14
2007,B,14
2007,C,14
2007,D,-14
2007,E,-14
2007,F,-14
  `.trim()} />
```

### Custom Intervals

- `timeParse`: a `d3-time-format` string
- `xInterval`: e.g. `year`, `month`, `day`— any [d3-time interval](https://github.com/d3/d3-time#intervals). Without the `time` prefix and all lowercase.
- `xIntervalStep`: Int

```react
<div>
  <ChartTitle>Every 6 Month</ChartTitle>
  <CsvChart
    config={{
      "type": "TimeBar",
      "x": "month",
      "timeParse": "%Y-%m",
      "timeFormat": "%Y Q%q",
      "colorRange": ["#ff7f0e"],
      "domain": [0,7.5],
      "numberFormat": ".1f",
      "unit": "imaginäre Punkte",
      "yTicks": [0, 2.5, 5, 7.5],
      "xTicks": ["2018-01", "2019-07", "2021-07", "2022-01", "2022-07"],
      "xInterval": "month",
      "xIntervalStep": 6,
      "xAnnotations": [
        {"x1": "2019-07", "x2": "2019-07","value": 5, "unit": "Punkte", "label": "Ziel 2020"},
        {"x1": "2019-07", "x2": "2019-07","value": 4,"label": "Stand jetzt","position": "bottom","showValue": false},
        {"x": "2022-01", "value": 7, "ghost": true}
      ]
    }}
    values={`
month,value
2018-01,1
2018-07,2
2019-01,3
2019-07,4
2021-07,6
2022-07,8
    `.trim()} />
</div>
```

### Annotations

Annotations try to automatically adjust themselves to the available space. `padding` should be at least half the width of the edge `xTicks` and can be used to prevent overlap with `yTicks`.

```react
<div>
  <ChartTitle>Ein historischer Einbruch</ChartTitle>
  <ChartLead>Jährliches Wirtschafts­wachstum in den USA</ChartLead>
  <CsvChart
    config={{
      "type": "TimeBar",
      "numberFormat": "+.1%",
      "padding": 14,
      "height": 300,
      "domain": [
        -0.2,
        0.2
      ],
      "yTicks": [
        -0.2,
        -0.1,
        0,
        0.1,
        0.2
      ],
      "xTicks": [
        1930,
        1950,
        1975,
        2000
      ],
      "color": "color",
      "colorRange": [
        "#ff7f0e",
        "#1f77b4"
      ],
      "colorLegend": false,
      "xAnnotations": [
        {
          "x": "2020",
          "value": -0.056,
          "label": "Prognose 2020",
          "position": "bottom"
        }
      ]
    }}
    values={`
year,value,color
1930,-0.085,negativ
1931,-0.064,negativ
1932,-0.129,negativ
1933,-0.012,negativ
1934,0.108,positiv
1935,0.089,positiv
1936,0.129,positiv
1937,0.051,positiv
1938,-0.033,negativ
1939,0.08,positiv
1940,0.088,positiv
1941,0.177,positiv
1942,0.189,positiv
1943,0.17,positiv
1944,0.08,positiv
1945,-0.01,negativ
1946,-0.116,negativ
1947,-0.011,negativ
1948,0.041,positiv
1949,-0.006,negativ
1950,0.087,positiv
1951,0.08,positiv
1952,0.041,positiv
1953,0.047,positiv
1954,-0.006,negativ
1955,0.071,positiv
1956,0.021,positiv
1957,0.021,positiv
1958,-0.007,negativ
1959,0.069,positiv
1960,0.026,positiv
1961,0.026,positiv
1962,0.061,positiv
1963,0.044,positiv
1964,0.058,positiv
1965,0.065,positiv
1966,0.066,positiv
1967,0.027,positiv
1968,0.049,positiv
1969,0.031,positiv
1970,0.002,positiv
1971,0.033,positiv
1972,0.053,positiv
1973,0.056,positiv
1974,-0.005,negativ
1975,-0.002,negativ
1976,0.054,positiv
1977,0.046,positiv
1978,0.055,positiv
1979,0.032,positiv
1980,-0.003,negativ
1981,0.025,positiv
1982,-0.018,negativ
1983,0.046,positiv
1984,0.072,positiv
1985,0.042,positiv
1986,0.035,positiv
1987,0.035,positiv
1988,0.042,positiv
1989,0.037,positiv
1990,0.019,positiv
1991,-0.001,negativ
1992,0.035,positiv
1993,0.028,positiv
1994,0.04,positiv
1995,0.027,positiv
1996,0.038,positiv
1997,0.044,positiv
1998,0.045,positiv
1999,0.048,positiv
2000,0.041,positiv
2001,0.01,positiv
2002,0.017,positiv
2003,0.029,positiv
2004,0.038,positiv
2005,0.035,positiv
2006,0.029,positiv
2007,0.019,positiv
2008,-0.001,negativ
2009,-0.025,negativ
2010,0.026,positiv
2011,0.016,positiv
2012,0.022,positiv
2013,0.018,positiv
2014,0.025,positiv
2015,0.029,positiv
2016,0.016,positiv
2017,0.024,positiv
2018,0.029,positiv
2019,0.023,positiv
2020,-0.056,negativ
    `.trim()} />
  <ChartLegend>
    Quellen: <Editorial.A href='https://apps.bea.gov/iTable/iTable.cfm?reqid=19&step=2#reqid=19&step=2&isuri=1&1921=survey'>Bureau of Economic Analysis (BEA)</Editorial.A>, <Editorial.A href='https://www.cbo.gov/publication/56335'>CBO</Editorial.A>
  </ChartLegend>
</div>
```

### Ordinal Scale

```react
<div>
  <ChartTitle>Alle Generationen sind gut vertreten</ChartTitle>
  <ChartLead>Aktuelle Altersverteilung bei Verlegerinnen mit angegebenem Geburtsdatum</ChartLead>
  <CsvChart
    config={{
      "type": "TimeBar",
      "x": "key",
      "unit": "Verlegerinnen",
      "xTicks": [20, 40, 60, 80, 100],
      "xScale": "ordinal",
      "padding": 0,
    }}
    values={`
key,value
18,0
19,3
20,4
21,11
22,16
23,23
24,37
25,53
26,37
27,49
28,57
29,73
30,107
31,129
32,121
33,138
34,153
35,132
36,160
37,171
38,168
39,158
40,159
41,176
42,146
43,143
44,143
45,141
46,133
47,149
48,140
49,171
50,140
51,162
52,166
53,153
54,155
55,198
56,164
57,173
58,202
59,142
60,139
61,154
62,148
63,173
64,140
65,126
66,141
67,161
68,142
69,156
70,147
71,123
72,102
73,103
74,96
75,88
76,87
77,59
78,49
79,33
80,26
81,21
82,19
83,8
84,12
85,7
86,8
87,8
88,3
89,3
90,0
91,1
92,0
93,1
94,1
95,0
96,0
97,0
98,1
99,0
100,0
    `.trim()} />
</div>
```

```react
<div>
  <ChartTitle>Die meisten Betriebe sind 10 bis 20 Hektaren gross</ChartTitle>
  <ChartLead>Anteil der Betriebe nach Nutzfläche in Hektaren</ChartLead>
  <CsvChart
    config={{
      "type": "TimeBar",
      "x": "category",
      "color": "year",
      "colorRange": [
        "#004529"
      ],
      "xScale": "ordinal",
      "unit": "der landwirtschaftlichen Betriebe",
      "numberFormat": ".1%",
      "padding": 10,
      "xTicks": [
        "1–3",
        "5–10",
        "20–30",
        "> 50"
      ]
    }}
    values={`
year,category,value
2018,< 1,0.041748603791395
2018,1–3,0.06330134507984
2018,3–5,0.049535908125541
2018,5–10,0.132777471879179
2018,10–20,0.292476205458979
2018,20–30,0.207976087469519
2018,30–50,0.156218044521356
2018,> 50,0.055966333674192
    `.trim()} />
  <ChartLegend>
    Daten für das Jahr 2019 sind nicht verfügbar. Quelle:  <Editorial.A href='https://www.bfs.admin.ch/bfs/de/home/statistiken/kataloge-datenbanken/tabellen.assetdetail.8346709.html'>Bundesamt für Statistik</Editorial.A>
  </ChartLegend>
</div>
```

### Small Multiples

```react
<div>
  <ChartTitle>Das Sterben setzt später ein</ChartTitle>
  <ChartLead>Überleben der Engländerinnen und Waliser</ChartLead>
  <CsvChart
    config={{
      "type": "TimeBar",
      "unit": "Überlebende",
      "x": "age",
      "column": "date",
      "columns": 3,
      "xScale": "linear",
      "padding": 10,
      "numberFormat": ".0%",
      "xTicks": [
        0,
        100
      ],
      "xUnit": "Alter",
      "xAnnotations": [
        {
          "column": "1851",
          "x": "40",
          "value": 0.54,
          "label": "Mit 40."
        },
        {
          "column": "2011",
          "x": "80",
          "value": 0.634,
          "label": "Mit 80."
        }
      ]
    }}
    values={`
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
0,2011,1
20,2011,0.993
40,2011,0.981
60,2011,0.925
80,2011,0.634
100,2011,0.021
    `.trim()} />
  <ChartLegend>
    Quelle: <Editorial.A href='https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationprojections/compendium/nationalpopulationprojections/2014basedreferencevolumeseriespp2/chapter4mortality2014basednationalpopulationprojectionsreferencevolume'>Office for National Statistics</Editorial.A>
  </ChartLegend>
</div>
```

### Inverted Y Scale

```react
<div>
  <ChartTitle>Wer alles ärmer ist als Sie...</ChartTitle>
  <ChartLead>Vermögensverteilung in der Schweiz (Einzelpersonen)</ChartLead>
  <CsvChart
    config={{
  "type": "TimeBar",
  "x": "percentile",
  "xScale": "linear",
  "padding": 0,
  "numberFormat": "(.0f",
  "xTicks": [
    0,
    25,
    50,
    75,
    99
  ],
  "yTicks": [
    100000,
    50000
  ],
  "xBandPadding": 0.5,
  "height": 400,
  "color": "color",
  "colorLegend": false,
  "colorMap": {
    "default": "#D5D8D7",
    "estimate": "#00A000",
    "reality": "#D02324"
  },
  "unit": "Franken",
  "xUnit": "Perzentil",
  "yScaleInvert": true,
  "xAnnotations": [
    {
      "x": "40",
      "value": 6000,
      "label": "Schätzung",
      "showValue": false,
      "position": "bottom",
      "textAlignment": "right"
    },
    {
      "x": "74",
      "value": 90712,
      "label": "Tatsächlich",
      "showValue": false,
      "position": "bottom",
      "textAlignment": "right"
    },
    {
      "x1": "0",
      "x2": "70",
      "value": 68139,
      "label": "70. Perzentile",
      "showValue": true,
      "unit": "Franken",
      "position": "bottom",
      "leftLabel": true
    },
  ]
}}
    values={`
percentile,color,value
0,default,0
1,default,0
2,default,0
3,default,0
4,default,0
5,default,0
6,default,0
7,default,0
8,default,0
9,default,0
10,default,0
11,default,0
12,default,0
13,default,0
14,default,0
15,default,0
16,default,0
17,default,0
18,default,0
19,default,0
20,default,0
21,default,0
22,default,0
23,default,0
24,default,0
25,default,0
26,default,0
27,default,0
28,default,0
29,default,88
30,default,305
31,default,583
32,default,920
33,default,1317
34,default,1775
35,default,2292
36,default,2870
37,default,3507
38,default,4203
39,default,4958
40,estimate,5770
41,default,6640
42,default,7565
43,default,8546
44,default,9579
45,default,10665
46,default,11802
47,default,12988
48,default,14222
49,default,15504
50,default,16830
51,default,18203
52,default,19620
53,default,21083
54,default,22594
55,default,24156
56,default,25773
57,default,27454
58,default,29208
59,default,31051
60,default,33002
61,default,35089
62,default,37346
63,default,39820
64,default,42571
65,default,45676
66,default,49238
67,default,53360
68,default,57976
69,default,62944
70,default,68139
71,default,73472
72,default,78921
73,default,84578
74,reality,90712
75,default,0
76,default,0
77,default,0
78,default,0
79,default,0
80,default,0
81,default,0
82,default,0
83,default,0
84,default,0
85,default,0
86,default,0
87,default,0
88,default,0
89,default,0
90,default,0
91,default,0
92,default,0
93,default,0
94,default,0
95,default,0
96,default,0
97,default,0
98,default,0
99,default,0
    `.trim()} />
  <ChartLegend>
    Quelle: <Editorial.A href='https://www.estv.admin.ch/estv/de/home.html'>ESTV</Editorial.A>
  </ChartLegend>
</div>
```
