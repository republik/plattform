SERVER=${SERVER:-api}

pnpm turbo run build \
  --filter="@orbiting/$SERVER-app..." \
  --cache=local:r,remote:r
