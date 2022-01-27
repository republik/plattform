FROM ruby:2.7-alpine

RUN gem install rake

RUN set -ex  \
    && apk add --update \
        nodejs \
        shared-mime-info \
    && apk add --virtual build-dependencies \
           build-base \
           ruby-dev \
    && gem install zendesk_apps_tools \
    && rm -rf /var/cache/apk/* 

WORKDIR /data

CMD ["zat", "server", "--bind", "0.0.0.0", "--config", "./settings.json"]

EXPOSE 4567
