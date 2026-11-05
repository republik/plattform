SERVER=${SERVER:-api}

pnpm turbo run build \
  --filter="@orbiting/$SERVER-app..." \
  --no-cache
