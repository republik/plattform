# Project R Site

Hub for all things Project R.

### Quick start

Bootstrap this app's `.env` file:
```
cp .env.example .env
```

From root directory, install dependencies and run:
```
yarn
yarn turbo run dev --filter=@project-r/construction...
```

The example env assumes a [Republik backend](https://github.com/orbiting/backends) running on port 5010. The backend needs to run on the same TLD for cookie sharing.
