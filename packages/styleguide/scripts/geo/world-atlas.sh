#!/bin/zsh

# npm i -g shapefile ndjson-cli d3-geo-projection topojson-simplify topojson-server topojson-client d3-dsv 

DIR=$(pwd)/$(dirname "$0")

mkdir -p $DIR/build

shp2json --encoding utf8 -n $DIR/custom/ne_110m_countries_fix_crimea_western_sahara.shp \
  | ndjson-map 'i = d.properties.ISO_N3, d.id = i === "-99" ? (d.properties.ISO_N3_EH !== "-99" ? d.properties.ISO_N3_EH : d.properties.SOV_A3) : i, d.properties = {name: d.properties.NAME}, d' \
  > $DIR/build/ne_10m_admin_0_countries_custom.ndjson

cat $DIR/build/ne_10m_admin_0_countries_custom.ndjson \
  | ndjson-filter 'd.id != "010"' \
  > $DIR/build/ne_10m_admin_0_countries_custom-without-antarctic.ndjson

geo2topo -q 1e5 -n countries=<( \
    ndjson-join 'd.id' <(cat $DIR/build/ne_10m_admin_0_countries_custom.ndjson) <(csv2json -n $DIR/country-names.csv) \
    | ndjson-map 'd[0].properties.name = d[1].name, d[0]' \
    | geostitch -n) \
  | topomerge land=countries \
  > $DIR/../../public/static/geo/world-atlas-110m.json

geo2topo -q 1e5 -n countries=<( \
    ndjson-join 'd.id' <(cat $DIR/build/ne_10m_admin_0_countries_custom-without-antarctic.ndjson) <(csv2json -n $DIR/country-names.csv) \
    | ndjson-map 'd[0].properties.name = d[1].name, d[0]' \
    | geostitch -n) \
  | topomerge land=countries \
  > $DIR/../../public/static/geo/world-atlas-110m-without-antarctic.json
