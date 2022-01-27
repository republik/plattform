if [ -z "$SERVER" ]
then
  cd apps/api
elif [ "$SERVER" = "styleguide" ]
then
  cd packages/styleguide
else
  cd apps/$SERVER
fi
yarn start
