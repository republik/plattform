Scratterplots make a scientist out of every reader. 
Go forth and make correlations visible, and tell everyone it proofs nothing!

```react
<div>
  <ChartTitle>Einkommen und CO<Sub>2</Sub>-Emissionen pro Kopf im Jahr 2014</ChartTitle>
  <ChartLead>Mit mehr Einkommen sind bisher meist auch mehr Emissionen verbunden.</ChartLead>
  <CsvChart
    config={{
      "type": "ScatterPlot",
      "label": "geo",
      "color": "region",
      "x": "income pp 2014",
      "y": "co2 pp 2014",
      "yUnit": "Tonnen CO<sub>2</sub>",
      "xUnit": "PPP-US-Dollar",
      "yNumberFormat": ".2f",
      "yScale": "log",
      "xScale": "log",
      "yTicks": [0.1, 0.5, 1, 10, 100],
      "yNice": 0,
      "xTicks": [500, 10000, 250000],
      "xNice": 0
    }}
    values={`
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
      `.trim()} />
  <ChartLegend>
    Quelle: <Editorial.A href='https://gapm.io/dgdppc'>Gapminder</Editorial.A> basierend auf World Bank, A. Maddison, M. Lindgren, IMF & mehr (Einkommen) und <Editorial.A href='http://cdiac.ess-dive.lbl.gov/trends/emis/meth_reg.html'>CDIAC</Editorial.A> (CO<Sub>2</Sub>)
  </ChartLegend>
</div>
```

## Inline Labels

Use `inlineLabel`, `inlineSecondaryLabel` and `inlineLabelPosition`. Valid positions are: `top`, `right`, `bottom`, `left` or the default `center`. Make sure to prevent overlap on mobile—always test with 290px width.

```react
<div>
  <ChartTitle>Parteienlandschaft Schweiz und Deutschland</ChartTitle>
  <ChartLead>Wie stehen die Parteien zur EU?</ChartLead>
  <CsvChart
    width={290}
    config={{
      "type": "ScatterPlot",
      "color": "family",
      "colorRange": ["#4B8A3E", "#D6862B", "#84B547", "#BF3939", "#3872B5", "#49A5E7", "#A65E42", "#F0554D"],
      "colorLegendValues": ["kommunistisch/sozialistisch", "sozialdemokratisch", "christdemokratisch", "grün/ökologisch", "agrarisch", "liberal", "konservativ", "rechts"],
      "numberFormat": ".1f",
      "paddingLeft": 15,
      "paddingTop": 18,
      "paddingRight": 8,
      "x": "lrgen",
      "y": "position",
      "yNice": 0,
      "yLines": [
        { "tick": 1, "label": "stark anti-EU" },
        { "tick": 4, "label": "neutral" },
        { "tick": 7, "label": "stark pro-EU" }
      ],
      "xLines": [
        { "tick": 0, "label": "extrem links", "base": false },
        { "tick": 5, "label": "Mitte" },
        { "tick": 10, "label": "extrem rechts" }
      ],
      "yUnit": "EU-Position",
      "xUnit": "Ideologie",
      "detail": "detail",
      "inlineLabel": "inline",
      "inlineSecondaryLabel": "inline_country",
      "inlineLabelPosition": "inline_pos",
      "size": "vote_abs",
      "sizeRangeMax": 40,
      "sizeUnit": "Stimmen",
      "sizeNumberFormat": ".2s",
      "sizeShowValue": false,
      "opacity": 0.5
    }}
    values={`
year,label,detail,family,position,lrgen,vote_abs,inline_pos,inline,inline_country
2017,Christlich Demokratische Union,"Deutschland
12,45 Mio. Stimmen im 2017",christdemokratisch,6.0625,5.5625,12447656,,CDU,
2017,Sozialdemokratische Partei Deutschlands,"9,54 Mio. Stimmen im 2017",sozialdemokratisch,6.5625,3.875,9539381,,SPD,
2017,Freie Demokratische Partei,"Deutschland
5,00 Mio. Stimmen im 2017",liberal,4.5625,6.5625,4999449,,FDP,
2017,Bündnis 90 / Die Grünen,"Deutschland
4,16 Mio. Stimmen im 2017",grün/ökologisch,6.7333331,2.9375,4158400,left,,
2017,Die Linke / PDS,"Deutschland
4,30 Mio. Stimmen im 2017",kommunistisch/sozialistisch,4.1875,1.4375,4297270,,,
2017,Christlich Soziale Union,"Deutschland
2,87 Mio. Stimmen im 2017",christdemokratisch,4.5625,7.375,2869688,right,CSU,
2017,Alternative für Deutschland,"5,88 Mio. Stimmen im 2017",rechts,1.8125,9.1875,5878115,,AfD,
2017,Schweizerische Volkspartei,"0,74 Mio. Stimmen im 2015",agrarisch,1,8.25,740967,top,SVP,
2017,Sozialdemokratische Partei,"Schweiz
0,48 Mio. Stimmen im 2015",sozialdemokratisch,6.1111112,2.125,475075,left,SP,Schweiz
2017,Freisinnig-Demokratische Partei,"Schweiz
0,41 Mio. Stimmen im 2015",liberal,3.7777777,6.875,413444,right,FDP,Schweiz
2017,Christlichdemokratische Volkspartei,"Schweiz
0,29 Mio. Stimmen im 2015",christdemokratisch,3.6666667,5.5,293653,bottom,CVP,
2017,Grüne,"Schweiz
0,18 Mio. Stimmen im 2015",grün/ökologisch,5.5555553,1.875,177944,right,Grüne,Schweiz
2017,Grünliberale Partei,"Schweiz
0,12 Mio. Stimmen im 2015",grün/ökologisch,5,5.25,116641,bottom,,
2017,Evangelische Volkspartei,"Schweiz
0,05 Mio. Stimmen im 2015",christdemokratisch,3.6666667,5.25,53042,left,,
2017,Bürgerlich–Demokratische Partei,"Schweiz
0,10 Mio. Stimmen im 2015",konservativ,3.625,6.25,103476,bottom,,
      `.trim()} />
  <ChartLegend>
    Quelle: <Editorial.A href='https://www.chesdata.eu/our-surveys/'>Chapel Hill Expert Survey 2017 und 2014</Editorial.A>, <Editorial.A href='http://www.parlgov.org/'>ParlGov database</Editorial.A>
  </ChartLegend>
</div>
```

