.PHONY: build deploy

-include .env

build:
	npm run build

deploy: build
	rsync -aP build/ ubuntu@styleguide.project-r.construction:/home/ubuntu/www/
