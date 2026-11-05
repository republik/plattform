# experiemntal script that is used as an heroku-prebuild
SERVER=${SERVER:-api}

# runs before dependencies are installed, so use the turbo version from package.json via dlx
TURBO_VERSION=$(node -p "require('./package.json').devDependencies.turbo")

if [ "$SERVER" = "styleguide" ]
then
  echo "Running prune for styleguide"
  pnpm dlx "turbo@$TURBO_VERSION" prune @project-r/styleguide -v
else
  echo "Running prune for $SERVER-app"
  pnpm dlx "turbo@$TURBO_VERSION" prune "@orbiting/$SERVER-app" -v
fi

if [ ! -f out/pnpm-lock.yaml ]
then
  echo "⚠️ Early exit 1 because no pnpm-lock.yaml was found in the out directory."
  exit 1
fi

if [ -f apps/www/.env ] || [ -f apps/api/.env ]
then
  echo "⚠️ Early exit 1 because .env files were detected. The pruned out will not overwrite the root directory."
  exit 1
fi

rm pnpm-lock.yaml
rm -rf packages
rm -rf apps
mv out/pnpm-lock.yaml ./
mv out/pnpm-workspace.yaml ./
if [ -d out/packages ]
then
  mv out/packages packages
fi
if [ -d out/apps ]
then
  mv out/apps apps
fi
# run install without frozen lockfile
pnpm install --no-frozen-lockfile
