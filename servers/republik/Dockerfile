FROM node:8.9.1

ENV NODE_ENV production
ENV PORT 3020

# Install binary dependencies

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY . /usr/src/app

# We need this to have sharp rebuilt for the container image architecture
RUN npm install --production sharp

RUN yarn install --production

EXPOSE 3020
CMD [ "npm", "run", "start" ]
