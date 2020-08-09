## GenericMap

The Equal Earth projection, by Bojan Šavrič et al., 2018.

```react
<div>
  <CsvChart
    config={{
      "type": "GenericMap",
      "colorLegend": false,
      "heightRatio": 0.5,
      "points": true,
      "pointLabel": "name",
      "opacity": 1,
      "colorRange": ["#000"],
      "features": {
        "url": "/static/geo/world-atlas-110m.json",
        "object": "land"
      }
    }}
    values={`
lat,lon,name
47.366667,8.55,"Zürich"
40.712778,-74.005833,"New York"
35.683889,139.774444,"Tokyo"
39.933333,116.383333,"Peking"
49.28098,-123.12244,"Vancouver"
`.trim()} />
  <Editorial.Note>Geobasis: <Editorial.A href="https://github.com/topojson/world-atlas">World Atlas TopoJSON</Editorial.A></Editorial.Note>
</div>
```

### Map with data points and tooltips

```react
<div>
  <CsvChart
    config={{
      type: 'GenericMap',
      heightRatio: 0.5,
      points: true,
      pointLabel: 'name',
      pointAttributes: ['Land'],
      colorLegend: false,
      sizeRangeMax: 300,
      unit: 't CO<sub>2</sub> pro Kopf',
      features: {
        url:
          '/static/geo/world-atlas-110m.json',
        object: 'land',
      },
    }}
    values={`
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
      136.8378,35.12043,"Nagoya",3.7218,"Japan"
      120.411,36.28456,"Qingdao",8.1821,"China"
      32.7928,39.9609,"Ankara",6.8533,"Turkey"
      30.3371,59.9087,"Saint Petersburg",6.9829,"Russia"
      54.454,24.4269,"Abu Dhabi",32.8602,"UAE"
      9.13365,45.5798,"Milan",7.9525,"Italy"
      34.8784,32.1031,"Tel Aviv-Yafo",11.5437,"Israel"
      121.6263,38.99737,"Dalian",9.3952,"China"
      153.0552,-27.51827,"Brisbane",19.0862,"Australia"
      118.5938,24.78757,"Quanzhou",8.4048,"China"
      120.6562,27.82322,"Wenzhou",6.4134,"China"
      50.0839,26.3944,"Ad Damman",19.8472,"Saudi Arabia"
      72.9619,19.1761,"Mumbai",1.4947,"India"
      51.4579,25.2746,"Doha",28.7132,"Qatar"
      106.5132,29.57461,"Chongqing",6.5559,"China"
      113.6637,34.76283,"Zhengzhou",7.179,"China"
      -93.2164,44.9888,"Minneapolis",21.7644,"USA"
      -2.36078,53.4913,"Manchester",9.4653,"UK"
      13.405,52.5129,"Berlin",10.4007,"Germany"
      -46.6011,-23.5479,"Sao Paulo",1.698,"Brazil"
      106.233,38.48197,"Yinchuan",25.2636,"China"
      -122.2551,47.45143,"Seattle",17.2947,"USA"
      -84.3574,33.8844,"Atlanta",18.7141,"USA"
      23.7196,38.0211,"Athens",10.7727,"Greece"
      -104.9711,39.72846,"Denver",19.4066,"USA"
      112.5425,37.83523,"Taiyuan",10.1129,"China"
      109.8445,40.62399,"Baotou",18.4846,"China"
      -71.1091,42.3653,"Boston",19.0138,"USA"
      111.672,40.83059,"Huhot",22.0458,"China"
      104.0681,30.69432,"Chengdu",4.3541,"China"
      108.9148,34.27534,"Xi'an",7.285,"China"
      150.9992,-33.82363,"Sydney",11.6716,"Australia"
      129.0178,35.19027,"Pusan",13.7911,"South Korea"
      88.283,22.4544,"Kolkata",1.7307,"India"
      -3.71157,40.4176,"Madrid",8.7745,"Spain"
      116.4689,23.44762,"Shantou",3.9664,"China"
      145.0297,-37.8087,"Melbourne",13.9293,"Australia"
      123.3946,41.79495,"Shenyang",8.0044,"China"
      118.7815,32.0514,"Nanjing",7.066,"China"
      -79.5519,43.722,"Toronto",9.7113,"Canada"
      120.2954,30.19798,"Hangzhou",7.0071,"China"
      114.2986,30.5573,"Wuhan",7.0301,"China"
      -112.0331,33.47676,"Phoenix",15.8974,"USA"
      121.3855,25.00582,"Taipei",6.1994,"Taiwan"
      101.6246,3.073899,"Shah Alam",8.5001,"Malaysia"
      -99.0966,19.4655,"Mexico City",2.808,"Mexico"
      -58.5965,-34.6496,"Buenos Aires",4.1468,"Argentina"
      135.5467,34.7454,"Osaka",3.785,"Japan"
      -77.1072,38.9262,"Washington D.C.",18.9625,"USA"
      39.2097,21.5221,"Jeddah",19.198,"Saudi Arabia"
      -95.4129,29.7709,"Houston",14.6026,"USA"
      7.04013,51.33,"Cologne",10.0302,"Germany"
      77.1916,28.6125,"New Delhi",2.5576,"India"
      -122.0793,37.48175,"San Jose",17.4855,"USA"
      -75.1326,39.9967,"Philadelphia",19.5442,"USA"
      -83.1926,42.456,"Detroit",25.4882,"USA"
      29.0052,41.0194,"Istanbul",5.2215,"Turkey"
      117.2377,39.08638,"Tianjin",8.9609,"China"
      -96.9646,32.8364,"Dallas",16.4596,"USA"
      2.33188,48.8549,"Paris",7.7125,"France"
      100.5417,13.75945,"Samut Prakan",5.3063,"Thailand"
      -80.2208,26.133,"Miami",15.9651,"USA"
      47.9852,29.2763,"Al-Ahmadi",29.8952,"Kuwait"
      106.8005,-6.289,"Jakarta",2.3034,"Indonesia"
      116.3516,39.91616,"Beijing",4.2042,"China"
      31.3098,30.5231,"Benha",2.5246,"Egypt"
      -0.147562,51.4941,"London",10.4272,"UK"
      37.6495,55.7439,"Moscow",6.8852,"Russia"
      51.2507,35.7061,"Tehran",8.2422,"Iran"
      28.1444,-26.1077,"Johannesburg",9.524,"South Africa"
      120.4197,31.5094,"Wuxi",9.1925,"China"
      55.3454,25.241,"Dubai",22.2961,"UAE"
      46.7299,24.6785,"Riyadh",20.6706,"Saudi Arabia"
      139.6472,35.72358,"Tokyo/Yokohama",4.0243,"Japan"
      -87.82,41.804,"Chicago",21.0648,"USA"
      103.8072,1.350698,"Country of Singapore",30.7692,"Singapore"
      121.4062,31.17447,"Shanghai",7.6019,"China"
      -118.08,34.00594,"Los Angeles",14.5675,"USA"
      114.1044,22.38772,"Hong Kong SAR",34.5765,"China"
      -73.947,40.7587,"New York",17.1069,"USA"
      113.4872,22.92145,"Guangzhou",6.1392,"China"
      126.9629,37.48175,"Seoul",12.989,"South Korea"
    `.trim()} />
  <Editorial.Note>Geobasis: <Editorial.A href="https://github.com/topojson/world-atlas">World Atlas TopoJSON</Editorial.A></Editorial.Note>
</div>
```

### World Wide Country Choropleth

```react
<div>
  <CsvChart
    config={{
      "type": "GenericMap",
      "colorLegend": true,
      "heightRatio": 0.469,
      "choropleth": true,
      "thresholds": [
        30,
        40,
        50,
        60,
        70,
        80,
        90
      ],
      "colorRange": [
        "#800026",
        "#bd0026",
        "#e31a1c",
        "#fc4e2a",
        "#fd8d3c",
        "#feb24c",
        "#fed976",
        "#ffeda0"
      ],
      "features": {
        "url":
          "/static/geo/world-atlas-110m-without-antarctic.json",
        "object": "countries"
      },
      "missingDataLegend": "Nicht untersucht",
      "label": "label",
      "legendTitle": "Medienfreiheit",
      "colorLegendPosition": "left",
      "colorLegendSize": 0.17,
      "colorLegendMinWidth": 90
    }}
    values={`
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
    `.trim()} />
  <Editorial.Note>Geobasis: <Editorial.A href="https://github.com/topojson/world-atlas">World Atlas TopoJSON</Editorial.A></Editorial.Note>
</div>
```

```
npm i -g shapefile ndjson-cli d3-geo-projection topojson-simplify topojson-server topojson-client d3-dsv 

shp2json --encoding utf8 -n ~/Desktop/world-map/world-wo-antarctic.shp \
  | ndjson-map 'i = d.properties.ISO_N3, d.id = i === "-99" ? (d.properties.SOV_A3 === "NOR" ? "578" : d.properties.SOV_A3) : i, d.properties = {name: d.properties.NAME}, d' \
  > ~/Desktop/world-map/world-wo-antarctic.ndjson

geo2topo -q 1e5 -n countries=<( \
    ndjson-join 'd.id' <(cat ~/Desktop/world-map/world-wo-antarctic.ndjson) <(csv2json -n public/static/geo/country-names.csv) \
    | ndjson-map 'd[0].properties.name = d[1].name, d[0]' \
    | geostitch -n) \
  | topomerge land=countries \
  > public/static/geo/world-atlas-110m-without-antarctic.json
```

## ProjectedMap

Want a special projection? Use `ProjectedMap` to render an pre-projected topojson file. `d3.geoIdentity` is used to fit the map into the viewport.

### Projecting WGS84 Data

For example with [`geoConicConformalEurope`](https://github.com/rveciana/d3-composite-projections) for a composite map with overseas [nuts regions](https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts).

_Examples below assume `topojson` v2._

#### `geoConicConformalEurope`

Europe with composition. Double dose of Malta.

```
npm i -g d3-composite-projections ndjson-cli

# project a wgs84 geojson with geoConicConformalEurope 
npx -p d3-geo-projection geoproject --require d3=d3-composite-projections 'd3.geoConicConformalEurope()' < nuts.json > nuts-projected.json
# project a wgs84 geojson of the composition border with a different projection 
npx -p d3-geo-projection geoproject 'p = d3.geoConicConformal().rotate([-10, -53]).parallels([0, 60]).scale(750), _ = p.translate(), k = p.scale(), x = +_[0], y = +_[1], p.translate([x - 0.08 * k, y]).clipExtent([[x - 0.51 * k, y - 0.33 * k],[x + 0.5 * k, y + 0.33 * k]]), p' < nuts-composition-borders.json > nuts-composition-borders-projected.json

# plot as svg to test?
# npx -p d3-geo-projection geo2svg -w 960 -h 960 < nuts-projected.json > nuts-projected.svg

# map to get clean id and name prop
ndjson-split 'd.features' \
  < nuts-projected.json \
  > nuts-projected.ndjson
ndjson-map 'd.id = d.properties.NUTS_ID, d.properties = {name: d.properties.NUTS_NAME}, d' \
  < nuts-projected.ndjson \
  > nuts-projected-clean.ndjson
ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' \
  < nuts-projected-clean.ndjson \
  > nuts-projected-clean.json

# generate topojson
npx -p topojson geo2topo -q 1e5 nuts=nuts-projected-clean.json cb=nuts-composition-borders-projected.json > nuts-topo.json

# npx -p topojson toposimplify -p 0.05 < nuts-topo.json > nuts-topo-simple.json
```

```react
<div>
  <CsvChart
    config={{
      "type": "ProjectedMap",
      "heightRatio": 0.77,
      "colorLegend": false,
      "features": {
        "url": "/static/geo/nuts2016-20m-l2.json",
        "object": "nuts",
        "compositionBorders": "cb"
      }
    }}
    values={''} />
  <Editorial.Note>Geobasis: <Editorial.A href="https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts">NUTS 2016 20M L2</Editorial.A></Editorial.Note>
</div>
```

#### `geoConicConformal`

Europe without composition.

```
npm i -g ndjson-cli d3-dsv

npx -p d3-geo-projection geoproject 'd3.geoConicConformal().rotate([-10, -53]).parallels([0, 60]).fitSize([960, 960], d)' < nuts.json > nuts-projected.json

# map to get clean id and name prop, filter out some regions
ndjson-split 'd.features' \
  < nuts-projected.json \
  > nuts-projected.ndjson
ndjson-filter '!["NO", "TR", "IS"].includes(d.properties.CNTR_CODE)' \
  < nuts-projected.ndjson \
  | ndjson-map 'd.id = d.properties.NUTS_ID, d.properties = {name: d.properties.NUTS_NAME}, d' \
  | ndjson-filter '!["FRA1", "FRA2", "FRA3", "FRA4", "FRA5", "ES70", "PT20", "PT30"].includes(d.id)' \
  > nuts-projected-filered.ndjson

# join names table and map name property
ndjson-join 'd.id' <(cat nuts-projected-filered.ndjson) <(csv2json -n names.csv) \
  | ndjson-map 'd[0].properties.name = d[1].name, d[0]' \
  > nuts-projected-clean.ndjson

ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' \
  < nuts-projected-clean.ndjson \
  > nuts-projected-clean.json

# generate topojson
npx -p topojson geo2topo nuts=nuts-projected-clean.json > nuts-topo.json

npx -p topojson toposimplify -p 1 < nuts-topo.json > nuts2013-20m-l2-custom-gdp.json
```

```react
<div>
  <ChartTitle>Zentraleuropäischer Wohlstandsgürtel</ChartTitle>
  <ChartLead>2016 BIP pro Kopf nach Regionen</ChartLead>
  <CsvChart
    config={{
      "type": "ProjectedMap",
      "heightRatio": 0.879,
      "choropleth": true,
      "colorRange": [
        "#c7e9c0",
        "#a1d99b",
        "#74c476",
        "#41ab5d",
        "#238b45",
        "#006d2c",
        "#00441b"
      ],
      "thresholds": [
        10000,
        15000,
        20000,
        25000,
        30000,
        40000
      ],
      "colorLegendMinWidth": 115,
      "legendTitle": "BIP pro Kopf in Euro",
      "unit": "Euro",
      "colorLegendSize": 0.3,
      "features": {
        "url": "/static/geo/nuts2013-20m-l2-custom-gdp.json",
        "object": "nuts"
      }
    }}
    values={data.nuts13mCHdGDP} />
  <Editorial.Note>Quelle: Eurostat. Das BIP pro Kopf ist nach Kaufkraft bereinigt. Geobasis: <Editorial.A href="https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts">NUTS 2013 20M L2</Editorial.A>, ohne entlegene Gebiete, fusionierte Schweiz</Editorial.Note>
</div>
```

#### Ordinal Colors

```
# npm i -g ndjson-cli d3-dsv topojson d3-geo-projection

geoproject 'd3.geoIdentity().clipExtent([[-24.5,33.870416],[35.156250,71.910888]])' < countries.json > countries-clipped.json

geoproject 'd3.geoConicConformal().rotate([-10, -53]).parallels([0, 60]).fitSize([960, 960], d)' < countries-clipped.json > countries-projected.json

ndjson-split 'd.features' \
  < countries-projected.json \
  > countries-projected.ndjson

ndjson-filter 'd.geometry && !["MA","DZ","TN","GL","SJ","RU","UA","TR","BY","MD"].includes(d.properties.CNTR_ID)' \
  < countries-projected.ndjson \
  | ndjson-map 'd.id = d.properties.CNTR_ID, d.properties = {name: d.properties.NAME_ENGL}, d' \
  > countries-projected-filered.ndjson

ndjson-join --left 'd.id' <(cat countries-projected-filered.ndjson) <(csv2json -n names.csv) \
  | ndjson-map 'd[1] && (d[0].properties.name = d[1].name), d[0]' \
  > countries-projected-clean.ndjson

ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' \
  < countries-projected-clean.ndjson \
  > countries-projected-clean.json

geo2topo countries=countries-projected-clean.json > countries-topo.json

toposimplify -p 1 < countries-topo.json > countries2016-20m-europe.json
```

```react
<div>
  <CsvChart
    config={{
      "type": "ProjectedMap",
      "heightRatio": 0.9,
      "choropleth": true,
      "color": "category",
      "colorLegendMinWidth": 100,
      "colorLegendSize": 0.3,
      "colorRange": ["#66c2a5", "#fc8d62", "#8da0cb"],
      "legendTitle": "E-ID-Angebote",
      "missingDataLegend": "Nicht untersucht",
      "features": {
        "url": "/static/geo/countries2016-20m-europe.json",
        "object": "countries"
      }
    }}
    values={`
feature,name,category
HR,Kroatien,Öffentliche Angebote dominieren
BE,Belgien,Öffentliche und private
DK,Dänemark,Private Angebote dominieren
DE,Deutschland,Öffentliche und private
EE,Estland,Öffentliche Angebote dominieren
FR,Frankreich,Öffentliche und private
UK,Grossbritannien,Private Angebote dominieren
IT,Italien,Öffentliche und private
LV,Lettland,Öffentliche und private
LT,Litauen,Öffentliche Angebote dominieren
LU,Luxemburg,Öffentliche und private
MT,Malta,Öffentliche Angebote dominieren
NL,Niederlande,Öffentliche und private
NO,Norwegen,Öffentliche und private
AT,Österreich,Öffentliche und private
PL,Polen,Öffentliche Angebote dominieren
PT,Portugal,Öffentliche Angebote dominieren
SE,Schweden,Öffentliche und private
CH,Schweiz,Private Angebote dominieren
SK,Slowakei,Öffentliche Angebote dominieren
ES,Spanien,Öffentliche Angebote dominieren
CZ,Tschechien,Öffentliche und private
SI,Slowenien,Öffentliche und private
FI,Finnland,Öffentliche und private
CY,Zypern,Öffentliche Angebote dominieren
HU,Ungarn,
BA,Bosnien und Herzegowina,
AL,Albanien,
BG,Bulgarien,
IE,Irland,
IS,Island,
EL,Griechenland,
LI,Liechtenstein,
ME,Montenegro,
MK,Nord Mazedonien,
RO,Rumänien,
RS,Serbien,
    `.trim()} />
  <Editorial.Note>Geobasis: <Editorial.A href="https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/countries">Eurostat Countries 2016 20M</Editorial.A></Editorial.Note>
</div>
```

### GeoTIFF

```react
<div>
  <ChartTitle></ChartTitle>
  <CsvChart
    config={{
      "type": "ProjectedMap",
      "heightRatio": 0.63,
      "features": {
        "url": "/static/geo/epsg2056-projected-ch-cantons-wo-lakes.json",
        "object": "cantons"
      },
      "geotiffLegendTitle": "Solar-Potential",
      "geotiffLegend": [
        {"color": "rgb(255,190,0)", "label": "Urban"},
        {"color": "rgb(255,120,0)", "label": "Berg"}
      ],
      "colorLegend": false,
      "geotiff": {
        "url": "/static/geo/solar.png",
        "bbox": [[
          131,23
        ], [
          842,465
        ]]
      }
    }}
    values={``}
  />
</div>
```

#### Generate PNG

```
# project to swiss grid
gdalwarp -t_srs EPSG:2056 pixels_only.tif projected.tif -overwrite -ts 1260 0
# color pixels
printf "0 0 0 0 0\n1 255 190 0 255\n2 255 120 0 255" > colors.txt
gdaldem color-relief -alpha -nearest_color_entry projected.tif colors.txt colored.png
# scale and trim & repage (optional, skip if its aligns untrimmt)
convert -trim +repage colored.png solar.png
```

#### Get BBOX

Get bounds of a GeoTIFF:

```
gdalinfo pixels_only.tif -json
```

However for a `ProjectedMap` it's probably easiest to get the topojson bounds with [the info command on mapshaper.org](https://mapshaper.org/) and then tweak it to perfectally align, only necessary if the pixel do not cover the full extent. For other map types you can use wgs84 bounds. Note currently rotated projections are not supported for geotiff alignment – you can't use `SwissMap` with it's rotated mercator.

## SwissMap

A rotated mercator projection is used to look like CH1903 while also allowing to plot regular coordinates. `features.url` is expected to point to an topojson file with WGS84 coordinates (EPSG:4326). If no WGS84 coordinates are needed it's better to use an `ProjectedMap` with a preprojected swiss grid. 

Convert a CH1903 shape file:

```
ogr2ogr -t_srs EPSG:4326 -s_srs EPSG:21781 -where "KT != '0'" ./wgs84.shp ./ch1903.shp

topojson \
    -o ./topo.json \
    --no-pre-quantization \
    --post-quantization=1e5 \
    --simplify=1e-9 \
    --id-property ID \
    -p name=NAME \
    -- ./wgs84.shp
```

_Example assumes `topojson` v1._


The `id` on a feature is used to match with data. And our maps assume a displayable name properties.

#### Swiss Base Data

[«Swiss Maps» by Interactive Things](https://github.com/interactivethings/swiss-maps) is a great way to get base data as topojson.

For example you can generate our cantons file with following command:

```
make topo/ch-cantons.json PROPERTIES="name --id-property=abbr" REPROJECT=true
```

### Cantons Example

```react
<div>
  <ChartTitle>Fonds zur Beschaffung des Kampfflugzeugs Gripen</ChartTitle>
  <CsvChart
    config={{
      "type": "SwissMap",
      "legendTitle": "Jastimmen",
      "unit": "Jastimmen",
      "choropleth": true,
      "numberFormat": ".0%",
      "thresholds": [0.3,0.4,0.5,0.6,0.7],
      "colorRange": ["rgb(103,0,13)", "rgb(187,21,26)", "rgb(239,69,51)", "rgb(75,151,201)", "rgb(24,100,170)", "rgb(8,48,107)"],
      "features": {
        "url": "/static/geo/ch-cantons.json",
        "object": "cantons"
      }
    }}
    values={`
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
    `.trim()} />
  <Editorial.Note>Quelle: <Editorial.A href="https://www.bk.admin.ch/ch/d/pore/va/20140518/can584.html">Bundeskanzlei</Editorial.A></Editorial.Note>
</div>
```

#### Without Lakes

```react
<div>
  <ChartTitle>Fonds zur Beschaffung des Kampfflugzeugs Gripen</ChartTitle>
  <CsvChart
    config={{
      "type": "SwissMap",
      "legendTitle": "Jastimmen",
      "unit": "Jastimmen",
      "choropleth": true,
      "numberFormat": ".0%",
      "thresholds": [0.3,0.4,0.5,0.6,0.7],
      "colorRange": ["rgb(103,0,13)", "rgb(187,21,26)", "rgb(239,69,51)", "rgb(75,151,201)", "rgb(24,100,170)", "rgb(8,48,107)"],
      "features": {
        "url": "/static/geo/ch-cantons-wo-lakes.json",
        "object": "cantons"
      }
    }}
    values={`
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
    `.trim()} />
  <Editorial.Note>Quelle: <Editorial.A href="https://www.bk.admin.ch/ch/d/pore/va/20140518/can584.html">Bundeskanzlei</Editorial.A></Editorial.Note>
</div>
```

### Municipalities Example

```react
<div>
  <ChartTitle>Zersiedelungsindex 2010</ChartTitle>
  <CsvChart
    config={{
      "type": "SwissMap",
      "legendTitle": "Indexwert",
      "choropleth": true,
      "thresholds": [3,6,10,20],
      "colorRange": ["rgb(24,100,170)", "rgb(75,151,201)", "rgb(239,69,51)", "rgb(187,21,26)", "rgb(103,0,13)"],
      "numberFormat": "s",
      "feature": "bfs",
      "features": {
        "url": "/static/geo/bfs-g3g12.json",
        "object": "mun"
      }
    }}
    values={data.mun} />
  <Editorial.Note>Quelle: <Editorial.A href="https://www.haupt.ch/Verlag/Buecher/Natur/Umwelt-Oekologie/Zersiedelung-messen-und-begrenzen.html">Fachbuch «Zersiedelung messen und begrenzen»</Editorial.A>, <Editorial.A href="https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html">BFS</Editorial.A></Editorial.Note>
</div>
```
