## World Maps Data

We use the [naturalearthdata.com](https://www.naturalearthdata.com/downloads/) 1:110m data for world maps. However their [«_de facto_» policy regarding disputed boundaries](https://www.naturalearthdata.com/about/disputed-boundaries-policy/) does not fit our need. They made some progress on the issue with the [v5 release in December 2021](https://github.com/nvkelso/natural-earth-vector/releases/tag/v5.0.0) by providing multiple viewpoints at the 1:10m resolution. But we can't profit from this effort so far — 1:10m can't automatically be simplified to lower resolutions without creating unpleasant visual artifacts and major inaccuracies.

Therefore we maintain our own custom shapefile, based on version 5.0.1.

Changes on March 18th 2022:

- Crimea has been moved back to Ukraine
- Western Sahara is expanded westwards all the way to the sea

The `scripts/geo/world-atlas.sh` script is used to create topojson files with and without antarctic from the shapefile and merge in our `scripts/geo/country-names.csv`.
