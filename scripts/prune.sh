# experiemntal script that is used as an heroku-prebuild
SERVER=${SERVER:-api}

if [ "$SERVER" = "styleguide" ]
then
  yarn turbo prune --scope="@project-r/styleguide"
else
  yarn turbo prune --scope="@orbiting/$SERVER-app"
fi
rm yarn.lock
rm -rf packages
rm -rf apps
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