Vertical bars are a nice line chart alternative for change over time of one (stacked) series.

Currently only supports years on the x-axis. If you need a different time unit you have to use the line chart for now.

```react
<div>
  <ChartTitle>Entwicklung der Treibhausgas-Emissionen in Deutschland</ChartTitle>
  <ChartLead>in Millionen Tonnen CO<Sub>2eq</Sub> pro Jahr</ChartLead>
  <CsvChart t={t}
    config={{
      "type": "TimeBar",
      "color": "gas",
      "unit": "Tonnen",
      "numberFormat": ".3s",
      "xAnnotations": [
        {"x1": "2008","x2": "2012","value": 973619338.97,"label": "Kyoto-Protokoll"},
        {"x": "2020","value": 748700000,"label": "Ziel 2020","ghost": true}, 
        {"x": "2050","value": 249600000,"label": "Ziel 2050","valuePrefix": "max: ","ghost": true}
      ],
      "padding": 55
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
  <Editorial.Note style={{marginTop: 10, marginBottom: 0}}>
    *ohne Kohlendioxid aus Landnutzung, Landnutzungsänderungen und Forstwirtschaft. Daten für 2016 sind vorläufig.
  </Editorial.Note>
  <Editorial.Note style={{marginTop: 10}}>
    Quelle: Umweltbundesamt, Nationale Treibhausgas-Inventare 1990 bis 2015 (Stand 02/2017) und Schätzung für 2016 (Stand 03/2017).
    <br /><Editorial.A href='https://creativecommons.org/licenses/by-nc-nd/4.0/deed.de'>CC BY-NC-ND 4.0 Bundesregierung</Editorial.A>
  </Editorial.Note>
</div>
```

## Diverging

```react
<div>
  <ChartTitle>Ordentliches Finanzierungsergebnis des Bundes</ChartTitle>
  <ChartLead>in Milliarden CHF</ChartLead>
  <CsvChart t={t}
    config={{
      "type": "TimeBar",
      "color": "type",
      "colorRange": ["#90AA00", "#542785"],
      "xTicks": [1990, 2000, 2010, 2016],
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
  <Editorial.Note style={{marginTop: 10}}>
    Quelle: <Editorial.A href='https://www.efv.admin.ch/efv/de/home/finanzberichterstattung/bundeshaushalt_ueb/stat_kennz_bundeshh.html'>Eidgenössische Finanzverwaltung</Editorial.A>
  </Editorial.Note>

</div>
```

### Diverging Stacks

```react
<CsvChart t={t}
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

