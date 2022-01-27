if [ -z "$SERVER" ] || [ "$SERVER" = "api" ] || [ "$SERVER" = "assets" ]
then
  yarn turbo run build --scope="@orbiting*" --no-deps --include-dependencies
elif [ "$SERVER" = "styleguide" ]
then
  yarn turbo run build --scope="@project-r/styleguide" --no-deps --include-dependencies
else
  yarn turbo run build --scope="$SERVER" --no-deps --include-dependencies
fi
