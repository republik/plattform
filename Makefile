.PHONY: build deploy

-include .env

build:
	npm run build

deploy: build
	s3cmd sync --verbose \
		--acl-public \
		-c ./.s3cfg \
		--access_key=$(S3_ACCESS_KEY) \
		--secret_key=$(S3_SECRET_KEY) \
		build/ \
		s3://styleguide/
