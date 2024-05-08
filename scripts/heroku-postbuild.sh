SERVER=${SERVER:-api}

if [ "$SERVER" = "api" ]
then
  cp apps/api/Procfile Procfile
  yarn migrate:up
  # yarn geoip:download
fi
