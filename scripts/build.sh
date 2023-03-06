SERVER=${SERVER:-api}

if [ "$SERVER" = "styleguide" ]
then
  yarn turbo run build \
    --filter="@project-r/styleguide..." \
    --no-cache
elif [ "$SERVER" = "docs" ]
then
  yarn turbo run build \
    --filter="@republik/docs..."
else
  yarn turbo run build \
    --filter="@orbiting/$SERVER-app..." \
    --no-cache
fi
