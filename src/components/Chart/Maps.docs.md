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
      "features": {
        "url": "https://cdn.republik.space/s3/republik-assets/assets/geo/world-atlas-110m.json",
        "object": "land"
      }
    }}
    values={`
lat,lon
47.366667,8.55
`.trim()} />
  <Editorial.Note>Geobasis: <Editorial.A href="https://github.com/topojson/world-atlas">World Atlas TopoJSON</Editorial.A></Editorial.Note>
</div>
```

## ProjectedMap

Want a special projection? Use `ProjectedMap` to render an pre-projected topojson file. `d3.geoIdentity` is used to fit the map into the viewport.

### Projecting WGS84 Data

For example with `geoConicConformalEurope` for a composite map with overseas [nuts regions](https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts).

```
npm i -g d3-composite-projections

# project a wgs84 geojson with geoConicConformalEurope 
npx -p d3-geo-projection geoproject --require d3=d3-composite-projections 'd3.geoConicConformalEurope()' < nuts.json > nuts-projected.json
# project a wgs84 geojson of the composition border with a different projection 
npx -p d3-geo-projection geoproject 'p = d3.geoConicConformal().rotate([-10, -53]).parallels([0, 60]).scale(750), _ = p.translate(), k = p.scale(), x = +_[0], y = +_[1], p.translate([x - 0.08 * k, y]).clipExtent([[x - 0.51 * k, y - 0.33 * k],[x + 0.5 * k, y + 0.33 * k]]), p' < nuts-composition-borders.json > nuts-composition-borders-projected.json

# plot as svg to test?
# npx -p d3-geo-projection geo2svg -w 960 -h 960 < nuts-projected.json > nuts-projected.svg

# map to get clean id and name prop
npx -p ndjson-cli ndjson-split 'd.features' \
  < nuts-projected.json \
  > nuts-projected.ndjson
npx -p ndjson-cli ndjson-map 'd.id = d.properties.NUTS_ID, d.properties = {name: d.properties.NUTS_NAME}, d' \
  < nuts-projected.ndjson \
  > nuts-projected-clean.ndjson
npx -p ndjson-cli ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' \
  < nuts-projected-clean.ndjson \
  > nuts-projected-clean.json

# generate topojson
npx -p topojson geo2topo -q 1e5 nuts=nuts-projected-clean.json cb=nuts-composition-borders-projected.json > nuts-topo.json

# npx -p topojson toposimplify -p 0.05 < nuts-topo.json > nuts-topo-simple.json
```

_Example assumes `topojson` v2._

### Examples

```react
<div>
  <CsvChart
    config={{
      "type": "ProjectedMap",
      "heightRatio": 0.77,
      "points": true,
      "colorLegend": false,
      "features": {
        "url": "/static/geo/nuts2013-60m-l2-merged-ch.json",
        "object": "nuts",
        "compositionBorders": "cb"
      }
    }}
    values={`
x,y
408,327
    `.trim()} />
  <Editorial.Note>Geobasis: <Editorial.A href="https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts">NUTS 2013 60M L2</Editorial.A></Editorial.Note>
</div>
```

```react
<div>
  <ChartTitle>GDP per Capita, PPS, 2016</ChartTitle>
  <CsvChart
    config={{
      "type": "ProjectedMap",
      "heightRatio": 0.77,
      "choropleth": true,
      "missingDataLegend": "Keine Daten",
      "colorLegendSize": 0.3,
      "features": {
        "url": "/static/geo/nuts2013-20m-l2-merged-ch-mainland-simple.json",
        "object": "nuts"
      }
    }}
    values={data.nuts13mCHdGDP} />
  <Editorial.Note>Geobasis: <Editorial.A href="https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts">NUTS 2013 20M L2</Editorial.A>, ohne entlegene Gebiete, fusionierte Schweiz</Editorial.Note>
</div>
```

## SwissMap

`features.url` is expected to point to an topojson file with WGS84 coordinates (EPSG:4326). A rotated mercator projection is used to look like CH1903 while also allowing to plot regular coordinates and use `projection.fitSize` for responsive design.

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
        "url": "https://cdn.republik.space/s3/republik-assets/assets/geo/ch-cantons.json",
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
