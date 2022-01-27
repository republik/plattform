if [ -z "$SERVER" ] || [ "$SERVER" = "api" ]
then
  cp apps/api/Procfile Procfile
  yarn migrate:up
fi