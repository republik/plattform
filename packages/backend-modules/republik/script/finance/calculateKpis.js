require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const dayjs = require('dayjs')
const duration = require('dayjs/plugin/duration')
const _ = require('lodash')
const yargs = require('yargs')
const {
  calculateCancelledYearlyAbos,
} = require('../../lib/calculateKpis/kpiCalculations')

dayjs.extend(duration)

const argv = yargs
  .option('company', {
    alias: 'c',
    string: true,
    default: 'PROJECT_R',
  })
  .option('begin', {
    alias: 'b',
    describe: '(day in) first month e.g. 2019-02-01',
    coerce: dayjs,
    default: dayjs().subtract(1, 'month'),
  })
  .option('end', {
    alias: 'e',
    describe: '(day in) last month e.g. 2019-03-01',
    coerce: dayjs,
    default: dayjs().subtract(1, 'month'),
  })
  .help()
  .version().argv

const METHODS = ['PAYMENTSLIP', 'STRIPE', 'POSTFINANCECARD', 'PAYPAL']

const currency = new Intl.NumberFormat('de-CH', {
  minimumFractionDigits: 2,
  useGrouping: false,
})

const evaluateCompanyMonth = async (
  company,
  begin,
  end,
  endFiscalYear,
  pgdb,
) => {
  const query = `
    SELECT
      pay.id,
      pay."createdAt" AT TIME ZONE 'Europe/Zurich' "createdAt",
      pay."updatedAt" AT TIME ZONE 'Europe/Zurich' "updatedAt",
      pay.status,
      pay.method,
      c.name AS "companyName",
      p.total,
      p.donation,
      pkgs.name aS "packageName",
      r.type,
      po.amount,
      po.periods,
      po.price

    FROM "payments" pay

    INNER JOIN "pledgePayments" ppay ON ppay."paymentId" = pay.id
    INNER JOIN "pledges" p ON p.id = ppay."pledgeId"
    INNER JOIN "packages" pkgs ON pkgs.id = p."packageId"

    INNER JOIN "pledgeOptions" po ON po."pledgeId" = p.id
    INNER JOIN "packageOptions" pkgso ON pkgso.id = po."templateId"
    LEFT OUTER JOIN "rewards" r ON r.id = pkgso."rewardId"

    INNER JOIN "companies" c ON c.id = pkgs."companyId"

    WHERE
      (
        pay."createdAt" AT TIME ZONE 'Europe/Zurich' BETWEEN '${begin.format(
          'YYYY-MM-DD',
        )}' AND '${end.format('YYYY-MM-DD')}'
        OR pay."updatedAt" AT TIME ZONE 'Europe/Zurich' BETWEEN '${begin.format(
          'YYYY-MM-DD',
        )}' AND '${end.format('YYYY-MM-DD')}'
      )
      AND po.amount > 0

    GROUP BY pay.id, c.id, p.id, pkgs.id, r.id, po.id

    ORDER BY pay.id, c.id, p.id, pkgs.id, r.id, po.id
    ;
  `

  // console.log(query)

  const transactionItems = (await pgdb.query(query)).map((i) => {
    const days = endFiscalYear.diff(i.createdAt, 'days')

    const totalFiscalYear = Math.round((i.total / 365) * days)
    const totalTransitoryLiabilities = i.total - totalFiscalYear

    return {
      ...i,
      precomputed: {
        totalFiscalYear,
        totalTransitoryLiabilities,
      },
    }
  })

  const data = {}

  METHODS.forEach((method) => {
    data[method] = {}
    const results = data[method]

    if (company === 'PROJECT_R') {
      // 240 CHF für PROJECT_R
      const MitgliedschaftBetrag = 100 * 240

      /**
       * Mitgliedschaften
       */

      const Mitgliedschaften = transactionItems
        .filter((i) => i.createdAt >= begin && i.createdAt < end)
        .filter((i) => i.companyName === company)
        .filter((i) => i.method === method)
        .filter((i) => i.type === 'MembershipType')

      results.Mitgliedschaften = {
        Anzahl: Mitgliedschaften.map((m) => m.amount * (m.periods || 1)).reduce(
          (p, c) => p + c,
          0,
        ),
        Betrag:
          Mitgliedschaften.map(
            (m) => m.amount * (m.periods || 1) * MitgliedschaftBetrag,
          ).reduce((p, c) => p + c, 0) / 100,
      }

      /**
       * Stornierte Mitgliedschaften
       */

      const StornierteMitgliedschaften = transactionItems
        .filter((i) => i.updatedAt >= begin && i.updatedAt < end)
        .filter((i) => i.companyName === company)
        .filter((i) => i.method === method)
        .filter((i) => i.type === 'MembershipType')
        .filter((i) => ['CANCELLED', 'REFUNDED'].includes(i.status))

      results.StornierteMitgliedschaften = {
        Anzahl: StornierteMitgliedschaften.map(
          (m) => m.amount * (m.periods || 1),
        ).reduce((p, c) => p + c, 0),
        Betrag:
          StornierteMitgliedschaften.map(
            (m) => m.amount * (m.periods || 1) * MitgliedschaftBetrag,
          ).reduce((p, c) => p - c, 0) / 100,
      }

      /**
       * Reduzierte Mitgliedschaften
       */

      const ReduzierteMitgliedschaften = Mitgliedschaften.filter(
        (m) => m.donation < 0,
      )

      results.ReduzierteMitgliedschaften = {
        Betrag:
          ReduzierteMitgliedschaften.map(
            (m) => m.amount * (m.periods || 1) * m.donation,
          ).reduce((p, c) => p + c, 0) / 100,
      }

      /**
       * Stornierte, reduzierte Mitgliedschaften
       */

      const StornierteReduzierteMitgliedschaften =
        StornierteMitgliedschaften.filter((m) => m.donation < 0)

      results.StornierteReduzierteMitgliedschaften = {
        Betrag:
          StornierteReduzierteMitgliedschaften.map(
            (m) => m.amount * (m.periods || 1) * m.donation,
          ).reduce((p, c) => p - c, 0) / 100,
      }

      /**
       * Gönner-Mitgliedschaften
       */

      const GoennerMitgliedschaften = Mitgliedschaften.filter(
        (i) =>
          i.packageName === 'BENEFACTOR' ||
          (i.packageName === 'PROLONG' && i.price >= 100000),
      )

      results.GoennerMitgliedschaften = {
        Anzahl: GoennerMitgliedschaften.map(
          (m) => m.amount * (m.periods || 1),
        ).reduce((p, c) => p + c, 0),
        Betrag:
          GoennerMitgliedschaften.map(
            (m) =>
              m.amount * (m.periods || 1) * (m.price - MitgliedschaftBetrag),
          ).reduce((p, c) => p + c, 0) / 100,
      }

      /**
       * Stornierte Gönner-Mitgliedschaften
       */

      const StornierteGoennerMitgliedschaften =
        StornierteMitgliedschaften.filter(
          (i) =>
            i.packageName === 'BENEFACTOR' ||
            (i.packageName === 'PROLONG' && i.price >= 100000),
        )

      results.StornierteGoennerMitgliedschaften = {
        Anzahl: StornierteGoennerMitgliedschaften.map(
          (m) => m.amount * (m.periods || 1),
        ).reduce((p, c) => p + c, 0),
        Betrag:
          StornierteGoennerMitgliedschaften.map(
            (m) =>
              m.amount * (m.periods || 1) * (m.price - MitgliedschaftBetrag),
          ).reduce((p, c) => p - c, 0) / 100,
      }

      /**
       * Spenden
       */

      const Spenden = _.uniqBy(transactionItems, 'id')
        .filter((i) => i.createdAt >= begin && i.createdAt < end)
        .filter((i) => i.companyName === company)
        .filter((i) => i.method === method)
        .filter(
          (i) =>
            i.donation > 0 || ['DONATE', 'DONATE_POT'].includes(i.packageName),
        )

      results.Spenden = {
        Betrag:
          Spenden.map((m) =>
            ['DONATE', 'DONATE_POT'].includes(m.packageName)
              ? m.total
              : m.donation,
          ).reduce((p, c) => p + c, 0) / 100,
      }

      /**
       * Stornierte Spenden
       */

      const StornierteSpenden = _.uniqBy(transactionItems, 'id')
        .filter((i) => i.updatedAt >= begin && i.updatedAt < end)
        .filter((i) => i.companyName === company)
        .filter((i) => i.method === method)
        .filter(
          (i) =>
            i.donation > 0 || ['DONATE', 'DONATE_POT'].includes(i.packageName),
        )
        .filter((i) => ['CANCELLED', 'REFUNDED'].includes(i.status))

      results.StornierteSpenden = {
        Betrag:
          StornierteSpenden.map((m) =>
            ['DONATE', 'DONATE_POT'].includes(m.packageName)
              ? m.total
              : m.donation,
          ).reduce((p, c) => p - c, 0) / 100,
      }
    } // if (company === 'PROJECT_R')

    if (company === 'REPUBLIK') {
      /**
       * Abonnements
       */

      const Abonnements = transactionItems
        .filter((i) => i.createdAt >= begin && i.createdAt < end)
        .filter((i) => i.companyName === company)
        .filter((i) => i.method === method)
        .filter((i) => ['MONTHLY_ABO'].includes(i.packageName))
        .filter((i) => i.type === 'MembershipType')

      results.Abonnements = {
        Anzahl: Abonnements.map((m) => m.amount * (m.periods || 1)).reduce(
          (p, c) => p + c,
          0,
        ),
        Betrag:
          Abonnements.map((m) => m.amount * (m.periods || 1) * m.price).reduce(
            (p, c) => p + c,
            0,
          ) / 100,
      }

      /**
       * Stornierte Abonnements
       */

      const StornierteAbonnements = transactionItems
        .filter((i) => i.updatedAt >= begin && i.updatedAt < end)
        .filter((i) => i.companyName === company)
        .filter((i) => i.method === method)
        .filter((i) => ['MONTHLY_ABO'].includes(i.packageName))
        .filter((i) => i.type === 'MembershipType')
        .filter((i) => ['CANCELLED', 'REFUNDED'].includes(i.status))

      results.StornierteAbonnements = {
        Anzahl: StornierteAbonnements.map(
          (m) => m.amount * (m.periods || 1),
        ).reduce((p, c) => p + c, 0),
        Betrag:
          StornierteAbonnements.map(
            (m) => m.amount * (m.periods || 1) * m.price,
          ).reduce((p, c) => p - c, 0) / 100,
      }

      /**
       * Monats-Geschenkabos
       */

      const Monatsgeschenkabos = transactionItems
        .filter((i) => i.createdAt >= begin && i.createdAt < end)
        .filter((i) => i.companyName === company)
        .filter((i) => i.method === method)
        .filter((i) => i.packageName === 'ABO_GIVE_MONTHS')
        .filter((i) => i.type === 'MembershipType')

      results.Monatsgeschenkabos = {
        Anzahl: Monatsgeschenkabos.map(
          (m) => m.amount * (m.periods || 1),
        ).reduce((p, c) => p + c, 0),
        Betrag:
          Monatsgeschenkabos.map(
            (m) => m.amount * (m.periods || 1) * m.price,
          ).reduce((p, c) => p + c, 0) / 100,
      }

      /**
       * Stornierte Monats-Geschenkabos
       */

      const StornierteMonatsgeschenkabos = transactionItems
        .filter((i) => i.updatedAt >= begin && i.updatedAt < end)
        .filter((i) => i.companyName === company)
        .filter((i) => i.method === method)
        .filter((i) => i.packageName === 'ABO_GIVE_MONTHS')
        .filter((i) => i.type === 'MembershipType')
        .filter((i) => ['CANCELLED', 'REFUNDED'].includes(i.status))

      results.StornierteMonatsgeschenkabos = {
        Anzahl: StornierteMonatsgeschenkabos.map(
          (m) => m.amount * (m.periods || 1),
        ).reduce((p, c) => p + c, 0),
        Betrag:
          StornierteMonatsgeschenkabos.map(
            (m) => m.amount * (m.periods || 1) * m.price,
          ).reduce((p, c) => p - c, 0) / 100,
      }

      /**
       * Jahresabonnements (YEARLY_ABO)
       */

      const Jahresabonnements = transactionItems
        .filter((i) => i.createdAt >= begin && i.createdAt < end)
        .filter((i) => i.companyName === company)
        .filter((i) => i.method === method)
        .filter((i) => ['YEARLY_ABO'].includes(i.packageName))
        .filter((i) => i.type === 'MembershipType')

      results.JahresabonnementsAktuellesGeschaeftsjahr = {
        Betrag:
          Jahresabonnements.map((a) => a.precomputed.totalFiscalYear).reduce(
            (p, c) => p + c,
            0,
          ) / 100,
      }
      results.JahresabonnementsTransitorischePassive = {
        Betrag:
          Jahresabonnements.map(
            (a) => a.precomputed.totalTransitoryLiabilities,
          ).reduce((p, c) => p + c, 0) / 100,
      }

      /**
       * Stornierte Jahresabonnements (YEARLY_ABO)
       */
      const StornierteJahresabonnements = transactionItems
        .filter((i) => i.updatedAt >= begin && i.updatedAt < end)
        .filter((i) => i.companyName === company)
        .filter((i) => i.method === method)
        .filter((i) => ['YEARLY_ABO'].includes(i.packageName))
        .filter((i) => i.type === 'MembershipType')
        .filter((i) => ['CANCELLED', 'REFUNDED'].includes(i.status))

      const stornierteJahresabonnementsResults = calculateCancelledYearlyAbos(
        StornierteJahresabonnements,
        endFiscalYear,
      )
      results.StornierteJahresabonnementsAktuellesGeschaeftsjahr =
        stornierteJahresabonnementsResults.StornierteJahresabonnementsAktuellesGeschaeftsjahr
      results.StornierteJahresabonnementsTransitorischePassive =
        stornierteJahresabonnementsResults.StornierteJahresabonnementsTransitorischePassive
    }

    /**
     * Handelsware
     */

    const Handelsware = transactionItems
      .filter((i) => i.createdAt >= begin && i.createdAt < end)
      .filter((i) => i.companyName === company)
      .filter((i) => i.method === method)
      .filter((i) => i.type === 'Goodie')

    results.Handelsware = {
      Betrag:
        Handelsware.map((m) => m.amount * (m.periods || 1) * m.price).reduce(
          (p, c) => p + c,
          0,
        ) / 100,
    }

    /**
     * Stornierte Handelsware
     */

    const StornierteHandelsware = transactionItems
      .filter((i) => i.updatedAt >= begin && i.updatedAt < end)
      .filter((i) => i.companyName === company)
      .filter((i) => i.method === method)
      .filter((i) => i.type === 'Goodie')
      .filter((i) => ['CANCELLED', 'REFUNDED'].includes(i.status))

    results.StornierteHandelsware = {
      Betrag:
        StornierteHandelsware.map(
          (m) => m.amount * (m.periods || 1) * m.price,
        ).reduce((p, c) => p - c, 0) / 100,
    }
  })

  // console.log(data)

  Object.keys(data).forEach((method) => {
    Object.keys(data[method]).forEach((aggregation) => {
      const Anzahl = data[method][aggregation].Anzahl || ''
      const Betrag = currency.format(data[method][aggregation].Betrag || 0)
      console.log(
        `${company}\t${begin.format(
          'YYYY-MM',
        )}\t${method}\t${aggregation}\t${Anzahl}\t${Betrag}`,
      )
    })
  })
}

PgDb.connect()
  .then(async (pgdb) => {
    console.log(
      'Entität\tMonat\tZahlungsart\tAggregation\tAnzahl\tBetrag in CHF',
    )

    for (
      let begin = argv.begin.startOf('month');
      begin <= argv.end;
      begin = begin.add(1, 'month')
    ) {
      const end = begin.add(1, 'month')

      const month = begin.get('month')
      const year = begin.get('year')
      const endFiscalYear = begin
        .set('year', month <= 5 ? year : year + 1)
        .endOf('month')
        .set('month', 5)

      await evaluateCompanyMonth(argv.company, begin, end, endFiscalYear, pgdb)
    }

    await pgdb.close()
  })
  .catch((e) => {
    console.error(e)
  })
