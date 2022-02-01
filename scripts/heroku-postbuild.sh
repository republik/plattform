SERVER=${SERVER:-api}

# heroku skips the regular build task if heroku-postbuild is defined
./build.sh

if [ "$SERVER" = "api" ]
then
  cp apps/api/Procfile Procfile
  yarn migrate:up
fi
