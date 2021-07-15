# Republik Admin Frontend

## Usage

### Quick start

You need to have node 8.9+ installed.

Bootstrap your `.env` file:
```
cp .env.example .env
```

Install and run:
```
npm install
npm run dev
```

The example env assumes a [Republik backend](https://github.com/orbiting/backends) running on port 5000. The backend needs to run on the same TLD for cookie sharing.

### ZAT

(Very drafty section)

#### Develop

Copy and adopt `zat/settings.json.example` as `zat/settings.json`

Run and keep running [Zendesk App Tools](https://developer.zendesk.com/documentation/apps/app-developer-guide/zat/) server:

```
npm run zat:dev
```

Run republik-admin-frontend (as you would for development):

```
npm run dev
```

Open Zendesk with `zat=true` query parameter:
- https://{subdomain}.zendesk.com/agent/tickets/{Ticket ID}?zat=true

#### Publish

```
npm run zat:package
```

Upload latest ZIP file in zat/tmp to Zendesk https://{subdomain}.zendesk.com/agent/admin/apps/manage

#### Some resources

https://developer.zendesk.com/documentation/apps/app-developer-guide/zat/
https://github.com/zendesk/zat-docker/blob/master/Dockerfile
https://developer.zendesk.com/documentation/apps/app-developer-guide/manifest


## License

The source code is «BSD 3-clause» licensed.
