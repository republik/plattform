# Container Builder

The container builder is intended for local testing containers

It uses the pack CLI to generate a docker container that matches the Heroku deployment as
close as possible.

To run the container bukder run `yarn build:cnb <app> --env-file <build-env-file-path>`

The container builder has been tested with the API app.

