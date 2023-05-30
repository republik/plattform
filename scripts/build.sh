SERVER=${SERVER:-api}

yarn turbo run build \
  --filter="@orbiting/$SERVER-app..." \
  --no-cache
