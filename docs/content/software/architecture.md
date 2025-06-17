# Architecture

## Systems

```mermaid
graph TD;
  subgraph Clients [Clients]
    APP[Mobile app];
    MAGAZIN[Magazin];
    PUBLIKATOR[Publikator CMS];
    ADMIN[Admin tool];
    GOTO[Goto];
    APP --> MAGAZIN;
    GOTO --> MAGAZIN;
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
    MANDRILL[Mandrill];
    PLAUSIBLE[Plausible];
    ULTRA[Ultra dashboard];
    SENTRY[Sentry];

    BACKEND_MODULES --> MAILCHIMP;
    BACKEND_MODULES --> MANDRILL;

    MAGAZIN --> PLAUSIBLE;
    PUBLIKATOR --> SENTRY;
    ADMIN --> SENTRY;

    ULTRA --> DB;
  end
```

## Tools / Services

| Service | Description | Self hosted |
| --- | --- | --- |
| [Mailchimp](https://mailchimp.com/) | Newsletters |  |
| [Mandrill](https://mandrillapp.com/) | Transactional emails |  |
| [Plausible](https://plausible.io/) | analytics tool | ✅ |
| [Ultra dashboard](https://ultra-dashboard.com/) | data analysis tool | ✅ |
| [Sentry](https://sentry.io/) | Error tracking (only in internal tools) |  |
| [DatoCMS](https://www.datocms.com/) | Headless CMS for the website |  |

