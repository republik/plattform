# Postfinance Import

The Postfinance import goes through the follwoing steps:

1. If no `PF_SFTP_CONNECTIONS` are configured, `GOTO 4`.
2. Download all `camt053.xml` and `camt053.tar.gz` files from all configured Sftp servers.
3. Write these files to the following db table: `postfinanceImports`.
4. Read all files where `isImported === false` from the db.
5. Unpack all `tar` files. These contain one `camt053.xml` file and `.tiff` files. The images are scans of over the counter cash payments (Einzahlungsschein).
6. Convert images to `.jpeg`.
7. Parse XML files (c.f. [parseCamt053.u.jest.ts](parseCamt053.u.jest.ts)).
8. Filter out the following payment entries:

- All `DEBIT` entries.
- All `CREDIT` entries from `STRIPE`.
- All `CREDIT` entries from `PAYPAL`.
- All debit card `CREDIT` entries (Online Postfinance Zahlung).

9. Write payment entries to the follwing db table: `postfinancePayments`.
10. Run the payment matcher.
11. Send notifications.

## Config

As you can see in the `.env.example` file, the Sftp servers are configured as follows:

```
PF_SFTP_CONNECTIONS=[{ host: 'one.com', port: 2222, username: 'accountant', privateKey: '-----BEGIN OPENSSH PRIVATE KEY-----\n...\n\n-----END OPENSSH PRIVATE KEY-----\n'},{ host: 'two.com', port: 2222, username: 'accountant', privateKey: '-----BEGIN OPENSSH PRIVATE KEY-----\n...\n\n-----END OPENSSH PRIVATE KEY-----\n'}]
```

## Development

On development, you can run the postfinance import task as follows:

```
cd packages/republik-crowdfundings && yarn run dev:postfinance:import
```

If you prefere to work without a local Sftp server, you can get
the entries from the following db table from production: `postfinanceImports`.

If contains the files from the Sftp server. All files that `isImported === FALSE`
will be imported.
