# Datatrans

Datatrans authorizes and settles transactions.

## User initiated flow

Flow shows a successful payment of a pledge.

```mermaid
sequenceDiagram
    autonumber

    participant Browser
    participant Magazin
    participant GraphQL API
    participant Datatrans

    Browser->>Magazin:clicks "Pay" on /angebote

    Magazin->>+GraphQL API:calls mutation submitPledge
    GraphQL API->>-Magazin:returns pledgeId

    Magazin->>+GraphQL API:calls mutation datatransInit
    GraphQL API->>+Datatrans:calls POST /transactions
    Datatrans->>-GraphQL API:returns transactionId 
    GraphQL API->>-Magazin:returns authorizeUrl w/ transactionId

    Magazin->>Browser:asks to go to authorizeUrl
    Browser->>Datatrans:goes to authorizeUrl and interacts
    Datatrans->>Browser:asks to go to /angebot with status

    Browser->>Magazin:goes to /angebot with status

    Magazin->>+GraphQL API:calls mutation payPledge
    GraphQL API->>+Datatrans:ask to settle transaction
    Datatrans->>-GraphQL API:returns settled transaction
    GraphQL API-->>GraphQL API:stores alias as paymentSource
    GraphQL API->>-Magazin:returns type PledgeResponse

    Magazin->>Browser:asks to go to /konto ("success page")
    Browser->>Magazin:goes to /konto ("success page")
```

## AutoPay flow

Flow shows successful automated payment without user interaction.


```mermaid
sequenceDiagram
    autonumber

    participant Scheduler
    participant Datatrans

    Scheduler-->>Scheduler:finds user and its paymentSource
    Scheduler->>+Datatrans:asks to authorize and settle transaction w/ paymentSource
    Datatrans->>-Scheduler:returns settled transaction
```
