# experiemntal script that is used as an heroku-prebuild
SERVER=${SERVER:-api}

if [ "$SERVER" = "styleguide" ]
then
  npx turbo prune --scope="@project-r/styleguide"
else
  npx turbo prune --scope="@orbiting/$SERVER-app"
fi

if [ -f apps/www/.env ] || [ -f apps/api/.env ] || [ -f apps/assets/.env ]
then
  echo "⚠️ Early exit 1 because .env files were detected. The pruned out will not overwrite the root directory."
  exit 1
fi
ls -l 
ls -l out
rm yarn.lock
rm -rf packages
rm -rf apps
rm -rf docs
mv out/yarn.lock ./
if [ -d out/packages ]
then
  mv out/packages packages
fi
if [ -d out/apps ]
then
  mv out/apps apps
fi
# run yarn without frozen/immutable lockfile
yarn
