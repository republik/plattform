SERVER=${SERVER:-api}

if [ "$SERVER" = "api" ]
then
  cp apps/api/Procfile Procfile
  yarn geoip:download
fi
