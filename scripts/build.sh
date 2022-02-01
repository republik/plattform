SERVER=${SERVER:-api}

if [ "$SERVER" = "api" ] || [ "$SERVER" = "assets" ]
then
  yarn turbo run build \
    --scope="@orbiting/$SERVER-app" \
    --scope="@orbiting/backend-modules*" \
    --no-deps --include-dependencies
elif [ "$SERVER" = "styleguide" ]
then
  yarn turbo run build \
    --scope="@project-r/styleguide" \
    --no-deps --include-dependencies
else
  yarn turbo run build \
    --scope="@orbiting/$SERVER-app" \
    --no-deps --include-dependencies
fi
