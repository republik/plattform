SERVER=${SERVER:-www}

if [ "$SERVER" != "api" ]
then
  echo Removing .next/cache from apps/$SERVER
  rm -rf "apps/${SERVER}/.next/cache"
fi

