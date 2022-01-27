rm -rf .next
rm -rf node_modules/glamor
rm -rf node_modules/react
rm -rf node_modules/react-dom
rm -rf node_modules/@project-r/styleguide
rm -rf node_modules/.cache

sed -i.bak 's/\s*"preinstall": "npm run sg:unlink",\s*//g' ./package.json
rm package.json.bak

echo '\n⚠️  Make sure to restart the next.js server.\n'
