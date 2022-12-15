SERVER=${SERVER:-api}

if [ "$SERVER" = "styleguide" ]
then
  yarn turbo run build \
    --filter="@project-r/styleguide..." \
    --no-cache
else
  yarn turbo run build \
    --filter="@orbiting/$SERVER-app..." \
    --no-cache
fi
