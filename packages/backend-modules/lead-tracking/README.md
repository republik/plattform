# How to use the import script

To import emails from mail chimp csv use the following command

**Local**

```sh
node packages/backend-modules/lead-tracking/scripts/import.js -t 'mailchimp_tag' < path_to_csv.csv
```


**heroku** (not tested yet)

```sh
heroku run --no-tty node packages/backend-modules/lead-tracking/scripts/import.js -t 'mailchimp_tag' < path_to_csv.csv
```
