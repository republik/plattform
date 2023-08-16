# experiemntal script that is used as an heroku-prebuild
SERVER=${SERVER:-api}

echo "🧹 Pruning Server: $SERVER"

echo "Printing directory structure before prune"
ls -l

if [ "$SERVER" = "styleguide" ]
then
  echo "Pruning for scope @project-r/styleguide"
  npx turbo prune --scope="@project-r/styleguide"
else
  echo "Pruning for scope @orbiting/$SERVER-app"
  npx turbo prune --scope="@orbiting/$SERVER-app"
fi

if [ -f apps/www/.env ] || [ -f apps/api/.env ] || [ -f apps/assets/.env ]
then
  echo "⚠️ Early exit 1 because .env files were detected. The pruned out will not overwrite the root directory."
  exit 1
fi

echo "Printing directory structure after prune"
ls -l 
echo "Printing out directory structure (result of prune)"
ls -l out

echo "Remove all folders that were not pruned out (packages/, apps/, docs/ & yarn.lock)"
rm yarn.lock
rm -rf packages
rm -rf apps
rm -rf docs

echo "Moving pruned yarn.lock back to root"
mv out/yarn.lock ./
if [ -d out/packages ]
then
  echo "Moving pruned packages back to root"
  mv out/packages packages
fi
if [ -d out/apps ]
then
  echo "Moving pruned apps back to root"
  mv out/apps apps
fi

echo "Printing directory structure after prune"
ls -l

# run yarn without frozen/immutable lockfile
echo "Running yarn for pruned mono-repo"
yarn
