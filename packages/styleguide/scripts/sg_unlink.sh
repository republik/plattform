cd packages/styleguide

# wipe linked packages
rm -rf node_modules/glamor
rm -rf node_modules/react
rm -rf node_modules/react-dom
rm -rf node_modules/@project-r/styleguide
rm -rf node_modules/.cache

cd ../../
# fetch dependencies again
yarn install --check-files

echo '\n⚠️  Make sure to restart the next.js server.\n'
