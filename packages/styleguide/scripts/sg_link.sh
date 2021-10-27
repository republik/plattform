cd packages/styleguide

# link packages
yarn link @project-r/styleguide
rm -rf node_modules/glamor
rm -rf node_modules/react
rm -rf node_modules/react-dom
ln -s @project-r/styleguide/node_modules/glamor node_modules/glamor
ln -s @project-r/styleguide/node_modules/react node_modules/react
ln -s @project-r/styleguide/node_modules/react-dom node_modules/react-dom

cd ../../
