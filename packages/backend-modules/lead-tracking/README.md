# How to use the import script

To import emails from an exported mail chimp csv-file use the following command

**Local**

```sh
node packages/backend-modules/lead-tracking/scripts/import.js -t 'mailchimp_tag' < path_to_csv.csv
```


**heroku**

```sh
heroku run --app [app-name] --no-tty node packages/backend-modules/lead-tracking/scripts/import.js -t 'mailchimp_tag' < path_to_csv.csv
```
