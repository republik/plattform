SERVER=${SERVER:-api}

# Workaround: always build styleguide first
# somehow turbo does not wait for styleguide build to finish before starting server builds
yarn turbo run build \
  --scope="@project-r/styleguide" \
  --no-deps --include-dependencies

if [ "$SERVER" != "styleguide" ]
then
  yarn turbo run build \
    --scope="@orbiting/$SERVER-app" \
    --no-deps --include-dependencies
fi
