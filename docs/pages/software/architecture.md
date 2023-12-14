# Architecture

## Systems

```mermaid
graph TD;
  subgraph Clients [Clients]
  APP[Mobile app];
  MAGAZIN[Magazin];
  PUBLIKATOR[Publikator CMS];
  ADMIN[Admin tool];
  APP --> MAGAZIN;
  end

  subgraph Backend [Backend]
    API[GraphQL API];
    BACKEND_MODULES[Backend modules];
    API --> BACKEND_MODULES;
    MAGAZIN --> API;
    PUBLIKATOR --> API;
    ADMIN --> API;

    subgraph Databases [Databases]
      DB[PostgreSQL];
      BACKEND_MODULES --> DB;
    end

  end

  subgraph Services [Services]
    MAILCHIMP[Mailchimp];
    MANDRIL[Mandril];
    MATOMO[Matomo];
    ULTRA[Ultra dashboard];
    SENTRY[Sentry];

    BACKEND_MODULES --> MAILCHIMP;
    BACKEND_MODULES --> MANDRIL;

    MAGAZIN --> MATOMO;
    PUBLIKATOR --> SENTRY;
    ADMIN --> SENTRY;

    ULTRA --> DB;
  end
```

## Tools / Services

| Service | Description | Self hosted |
| --- | --- | --- |
| [Mailchimp](https://mailchimp.com/) | Newsletters |  |
| [Mandril](https://mandrillapp.com/) | Transactional emails |  |
| [Matomo](https://matomo.org/) | analytics tool | ✅ |
| [Ultra dashboard](https://ultra-dashboard.com/) | data analysis tool | ✅ |
| [Sentry](https://sentry.io/) | Error tracking (only in internal tools) |  |
| [DatoCMS](https://www.datocms.com/) | Headless CMS for the website |  |

