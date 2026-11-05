SERVER=${SERVER:-api}

if [ "$SERVER" = "api" ]
then
  cp apps/api/Procfile Procfile
  pnpm geoip:download
fi
