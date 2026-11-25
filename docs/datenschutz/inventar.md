# Datenschutz-Inventar

Verzeichnis der Personendaten in diesem Repository (Art. 12 DSG). Tools ausserhalb des Repos sind separat dokumentiert.

Pro Datenquelle sechs Angaben:

- **Quelle & Speicherort:** Woher die Daten kommen und wo sie liegen. Speicherort ist, wo nicht anders vermerkt, die Postgres-Datenbank der API. Die Zeile `Tabellen:` wird automatisch geprüft (siehe unten).
- **Daten:** Welche Arten von Personendaten.
- **Besonders schützenswert:** Ja/Nein nach Art. 5 lit. c DSG (z. B. politische oder religiöse Ansichten, Gesundheit), mit einem Satz Begründung.
- **Zweck:** Wofür sie erhoben und genutzt werden.
- **Verantwortung:** Owner (pflegt und schützt die Daten) und wer Zugriff hat. Zugriff ist als Rolle im Code angegeben.
- **Löschfrist:** Soll-Frist und was der Code heute löscht.

## Pflege

- Neue Tabelle in einer Migration: in derselben PR eintragen und nachführen.
- Löschfrist umgesetzt: bei «Heute» nachführen.

---

## Konto und Login

- **Quelle & Speicherort:** Die Person selbst (Registrierung). Porträts liegen Auf AWS S3, öffentliche Profile zusätzlich im Suchindex (Typesense). E-Mail und Name auch bei Stripe und Mailchimp.
- Tabellen: `users`, `addresses`, `sessions`, `tokens`, `consents`, `devices`, `userAttributes`
- **Daten:** Kontaktdaten (E-Mail, Name), bei Genossenschaftern zusätzliche Infos (Adresse), optionale Informationen (Telefon, Geburtsjahr, Gender), Profil (Porträt, Statement, Kommentarrollen), zusätzliche Informationen von Genossenschaftsrät:innen oder Mitarbeitenden (Biografie) Session mit IP-Adresse, User-Agent und Ort, Einwilligungen mit IP-Adresse, Geräte-Token für Push, interne Support-Notizen (`users.adminNotes`).
- **Besonders schützenswert:** Biografie (nur für Mitarbeitende oder Genossenschaftsrät:innen), Kommentarrollen und Support-Notizen sind Freitext und können politische oder religiöse Zugehörigkeit oder Gesundheitsangaben enthalten.
- **Zweck:** Konto führen, Anmeldung, Einwilligungen nachweisen, öffentliches Profil, Support.
- **Verantwortung:** Owner: Tech Lead. Zugriff: die Person selbst; `admin`, `supporter` (Admin-App).
- **Löschfrist:** Offen. Heute: Sessions nach Ablauf (Cookie 1 Jahr, für Rollen mit Admin-Zugang 1 Woche); `consents.ip` nach 365 Tagen geleert (databroom); Konto wird auf Anfrage gelöscht. Keine automatische Löschung.

## Dialog

- **Quelle & Speicherort:** Die Person selbst; Sperren durch die Moderation. Kommentare und Anzeigenamen bei öffentlichen Profilen zusätzlich im Suchindex (Typesense).
- Tabellen: `comments`, `credentials`, `discussionPreferences`, `discussionSuspensions`, `cf.comments`
- **Daten:** Kommentartexte (können politische Ansichten oder Gesundheitsangaben enthalten), Bewertungen und Meldungen mit User-IDs, Credentials, Anonymitätseinstellung, Sperren mit Begründung. `cf.comments` sind Kommentare aus dem Crowdfunding 2017 und werden im Code nicht mehr verwendet.
- **Besonders schützenswert:** Ja. Kommentare äussern häufig politische Ansichten und können Angaben zu Gesundheit oder Religion enthalten.
- **Zweck:** Debatte unter Beiträgen, Moderation.
- **Verantwortung:** Owner: Tech Lead. Zugriff: Kommentartexte für Mitglieder; Meldungen für `moderator`, `admin`; nur `admin` sieht, wer hinter einem anonymen Kommentar steht.
- **Löschfrist:** Bei Kontolöschung wird der Kommentar vom Konto getrennt und als "anonymer Kommentar" behalten. Bei explizitem Wunsch, werden die Kommentar-Inhalt selbst auch gelöscht.

## Abo und Mitgliedschaft

- **Quelle & Speicherort:** Die Person selbst; Stripe (Webhooks); bei Geschenken die schenkende Person. Abos auch bei Stripe, Abo-Status wird an Mailchimp übermittelt um E-Mail Segmente zu bilden.
- Tabellen: `memberships`, `membershipPeriods`, `membershipCancellations`, `pledges`, `pledgeOptions`, `payments.subscriptions`, `payments.subscriptionCancellations`, `payments.subscription_upgrades`, `referrals`, `userCampaignRewards`, `callToActions`
- **Daten:** Abo-Typ, Laufzeit, Status, Beträge, Kündigungsgründe (Freitext), Empfehlungen und Belohnungen, Hinweise im Frontend.
- **Besonders schützenswert:** Nein. Aber: Kündigungsgründe sind Freitext und können vereinzelt Gesundheitsangaben enthalten.
- **Zweck:** Zugang zum Magazin, Verlängerung und Kündigung, Rückgewinnung (Mailchimp).
- **Verantwortung:** Owner: Tech Lead. Zugriff: `admin`, `supporter`, `accountant`.
- **Löschfrist:** Bei Kontolöschung werden Kündigungsgründe gelöscht. Wenn eine Mitgliedschaften mit Zahlungen bestanden hat, wird der Account von allen persönlichen Daten bereinigt (für Buchhaltung relevant).

## Zahlungen und Buchhaltung

- **Quelle & Speicherort:** Die Person selbst; Stripe, PayPal und PostFinance (Webhooks, Kontoauszüge per SFTP).
  - Tabellen: `payments`, `pledgePayments`, `paymentSources`, `chargeAttempts`, `paymentsLog`, `postfinancePayments`, `postfinanceImports`, `stripeCustomers`, `payments.invoices`, `payments.charges`, `payments.orders`, `payments.orderLineItems`, `payments.stripeCustomers`, `payments.webhooks`
- **Daten:** Zahlungen, Rechnungen, Bestellungen mit E-Mail und Lieferadresse, Referenzen auf Zahlungsmittel (keine Kartennummern), Kontoauszüge mit Namen und Mitteilung der zahlenden Person, Rohdaten der Webhooks.
- **Besonders schützenswert:** Nein. Finanzdaten gelten nach DSG nicht als besonders schützenswert.
- **Zweck:** Zahlungen abwickeln und verbuchen, Erinnerungen, automatische Verlängerung.
- **Verantwortung:** Owner: Tech Lead. Zugriff: `accountant`, `admin`, `supporter`.
- **Löschfrist:** Gesetzliche Aufbewahrungspflicht (Buchungsbelege 10 Jahre, Art. 958f OR). `paymentsLog` nach 90 Tagen (databroom); Webhook-Rohdaten und Kontoauszugsdateien ohne Frist.

## Geschenke und geteilte Zugänge

- **Quelle & Speicherort:** Die schenkende bzw. teilende Person gibt E-Mail-Adresse und Nachricht der empfangenden Person ein.
  - Tabellen: `accessGrants`, `accessEvents`, `payments.giftVouchers`
- **Daten:** E-Mail der empfangenden Person, persönliche Nachricht, Gutscheincode, Einlösung.
- **Besonders schützenswert:** Nein. Einzig die persönliche Nachricht ist Freitext.
- **Zweck:** Geschenk-Abos und Probezugänge zustellen und einlösen.
- **Verantwortung:** Owner: Tech Lead. Zugriff: `admin`, `supporter`.
- **Löschfrist:** `accessEvents` nach 90 Tagen (databroom); abgelaufene Zugänge bleiben gespeichert.

## Newsletter und E-Mail-Versand

- **Quelle & Speicherort:** Die Person selbst; Mailchimp-Webhooks (An- und Abmeldungen, unzustellbare Adressen). Newsletter-Abos bei Mailchimp, Transaktionsmails über Mandrill (Teil von Mailchimp).
- Tabellen: `mailLog`, `mailchimpLog`, `newsletter_signups`, `leadTracking`
- **Daten:** E-Mail, Name, Newsletter-Abos, Abo-Status für Segmente, Versandprotokoll.
- **Besonders schützenswert:** Nein. Gespeichert werden Kontakt- und Versanddaten.
- **Zweck:** Newsletter, Transaktionsmails, Nachweis des Versands.
- **Verantwortung:** Owner: Tech Lead. Zugriff: `admin`, `supporter`.
- **Löschfrist:** `mailLog.info` nach 90 Tagen gekürzt, `mailLog.email` bleibt (databroom); Abgemeldete werden bei Mailchimp archiviert.

## Benachrichtigungen

- **Quelle & Speicherort:** Die Person selbst (folgt Autor:innen, Formaten oder Debatten). Push-Nachrichten über Firebase und Apple.
- Tabellen: `subscriptions`, `notifications`
- **Daten:** Abonnements, zugestellte Benachrichtigungen mit Inhalt.
- **Besonders schützenswert:** Nein. Es handelt sich um Hinweise auf Beiträge und Antworten.
- **Zweck:** Hinweise auf neue Beiträge und Antworten.
- **Verantwortung:** Owner: Tech Lead. Zugriff: die Person selbst, `admin`, `supporter`.
- **Löschfrist:** Bei angefragter Löschung. Keine automatische Löschung.

## Leseverhalten

- **Quelle & Speicherort:** Entsteht bei der Nutzung. Die materialisierten Views `next_reads*` enthalten Kopien und Aggregate davon.
  - Tabellen: `collectionDocumentItems`, `collectionMediaItems`, `next_reads.*`, `next_reads_sanity.*`
- **Daten:** Lesezeichen, Lese- und Hörfortschritt. Lässt Rückschlüsse auf Interessen zu.
- **Besonders schützenswert:** Nein.
- **Zweck:** Weiterlesen, Lesezeichen, Leseempfehlungen.
- **Verantwortung:** Owner: Tech Lead. Zugriff: die Person selbst und `admin`.
- **Löschfrist:** Bei angefragter Löschung. Keine automatische Löschung.

## Abstimmungen, Wahlen und Umfragen

- **Quelle & Speicherort:** Die Person selbst (Genossenschaftsmitglieder, Teilnehmende an Umfragen).
- Tabellen: `ballots`, `electionBallots`, `electionCandidacies`, `questionnaireSubmissions`, `answers`
- **Daten:** Stimm- und Wahlzettel mit User-ID, Kandidaturen, Umfrageantworten (teils Freitext, teils pseudonym gespeichert).
- **Besonders schützenswert:** Ja. Es werden keine allgemein politischen Ansichten erhoben, sondern nur Genossenschaftliche Anliegen. Stimmzettel sind mit der Person verknüpft bis 3 Monate nach Abstimmung.
- **Zweck:** Abstimmungen und Wahlen der Genossenschaft, Umfragen.
- **Verantwortung:** Owner: Tech Lead. Zugriff: Kandidaturen `admin`; Umfrage-Einreichungen je nach Einstellung der Umfrage.
- **Löschfrist:** Ballot werden 3 Monaten nach der Abstimmung / Wahl manuell gelöscht. Aggregierte Resultate werden aufbewahrt.

## Ohne Personenbezug

Konfiguration, Produkte, Kampagnen und Aggregate.

- Tabellen: `migrations`, `cf.feeds`, `accessCampaigns`, `bankAccounts`, `campaignRewards`, `campaigns`, `collections`, `companies`, `crowdfundingGoals`, `crowdfundings`, `discussions`, `electionMembershipRequirements`, `elections`, `embeds`, `events`, `goodies`, `gsheets`, `ipAllowlist`, `membershipTypes`, `notifyTableChangeQueue`, `packageOptions`, `packages`, `pgboss.*`, `questionnaireMembershipRequirements`, `questionnaires`, `questions`, `redirections`, `rewards`, `statisticsGeoCountry`, `statisticsGeoPostalCode`, `statisticsIndexes`, `statisticsMatomo`, `statisticsNameSex`, `statisticsQuotes`, `votingMembershipRequirements`, `votingOptions`, `votings`, `publikator.repos`, `publikator.commitsWithSynthReadAloud`, `cockpit_membership_evolution`, `cockpit_membership_last_seen`, `cockpit_discussions_evolution`, `cockpit_collections_evolution`
