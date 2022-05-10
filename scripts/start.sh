SERVER=${SERVER:-api}

if [ "$SERVER" = "styleguide" ]
then
  cd packages/styleguide
else
  cd apps/$SERVER
fi
yarn start
