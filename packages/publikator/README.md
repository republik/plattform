## Publikator

Here you find the code responsible for the CMS tasks.
## Email Tracking

You can add our own open beacon to newsletters by setting following environment variables:

```
PIWIK_URL_BASE=https://piwik.example.com
PIWIK_SITE_ID=1
```

_MailChimp tracking is automatically disabled when creating a new campaign._

## Embeds

The `embed` root query depends on 3rd party API calls and in order for them to work, you have to create apps on the respective platforms and put your credentials into your `.env` file.

#### Youtube

Create a new app: https://console.developers.google.com
In the dashboard, select "Library" on the right, then search for and add the **YouTube Data API v3** to your services.

Now select "Credentials" on the right and add the key to your `.env`:

```
YOUTUBE_APP_KEY=[your-key]
```

#### Vimeo

Create a new app here: https://developer.vimeo.com/.
Now select your new app and in the menu above the icon, click on authentication. Now you add to your `.env`:

```
VIMEO_APP_KEY=[The hash from field "Client Identifier"]
VIMEO_APP_SECRET=[The hash from field "Client Secret"]
```

#### Twitter

Create a new app here: https://apps.twitter.com/ and select it.
Go to section "Keys and Access Tokens" and add to your `.env`:

```
TWITTER_APP_KEY=[The hash from field "Consumer Key (API Key)"]
TWITTER_APP_SECRET=[The hash from field "Consumer Secret (API Secret)"]
```

## Licensing

The source code and it's documentation is licensed under [GNU AGPLv3](LICENSE)+.
