#!/bin/bash
set -e

if [[ -z "${MAXMIND_LICENSE_KEY}" ]]; then
  _MAXMIND_LICENSE_KEY=$(cat ./apps/api/.env | grep ^MAXMIND_LICENSE_KEY= | cut -f2 -d"=")
else
  _MAXMIND_LICENSE_KEY="${MAXMIND_LICENSE_KEY}"
fi

if [ "$_MAXMIND_LICENSE_KEY" ]
then
  mkdir -p ./local/geo
  echo "download geoip data ..."
  curl -o ./local/geo/geolite-city.tar.gz --silent --show-error \
    "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=$_MAXMIND_LICENSE_KEY&suffix=tar.gz"
  echo "unpack geoip data ..."
  tar -xzf ./local/geo/geolite-city.tar.gz --strip-components=1 -C ./local/geo/
else
  echo "unable to download geoip data. env MAXMIND_LICENSE_KEY missing"
fi
