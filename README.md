backend modules
---------------

modules used in various backend projects.


## development
```
yarn install
```

note: due to this [issue](https://github.com/lerna/lerna/issues/1125), we had to remove the `postinstall` script, thus making this repo work with yarn only. If you want to use it with npm add the script again
```
"postinstall": "lerna bootstrap"
```

To develop backend-modules in combination with a consuming project, first run `yarn run link` inside here then execute `yarn run link:backend-modules` in the consuming repo.
