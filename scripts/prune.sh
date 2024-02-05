# experiemntal script that is used as an heroku-prebuild
SERVER=${SERVER:-api}

if [ "$SERVER" = "styleguide" ]
then
  echo "Running prune for styleguide"
  npx turbo@1.10 prune --scope="@project-r/styleguide"
else
  echo "Running prune for $SERVER-app"
  npx turbo@1.10 prune --scope="@orbiting/$SERVER-app" -vv
fi

if [ ! -f out/yarn.lock ]
then
  echo "⚠️ Early exit 1 because no yarn.lock was found in the out directory."
  exit 1
fi

if [ -f apps/www/.env ] || [ -f apps/api/.env ] || [ -f apps/assets/.env ]
then
  echo "⚠️ Early exit 1 because .env files were detected. The pruned out will not overwrite the root directory."
  exit 1
fi

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
