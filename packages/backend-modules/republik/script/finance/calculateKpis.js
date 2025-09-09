require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const dayjs = require('dayjs')
const duration = require('dayjs/plugin/duration')
const _ = require('lodash')
const yargs = require('yargs')
const {
  calculateCancelledYearlyAbos,
  precomputeTransitoryLiabilities,
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

const isCancelledOrRefunded = (item) => {
  return ['CANCELLED', 'REFUNDED', 'FAILED'].includes(item.status.toUpperCase())
}

const isBenefactorSubscriptionOrMembership = (item) => {
      return item.packageName === 'BENEFACTOR' || item.packageName === 'BENEFACTOR_SUBSCRIPTION' ||
        (item.packageName === 'PROLONG' && item.price >= 100000)
    }

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
      pay.status::text,
      pay.method::text,
      c.name AS "companyName",
      p.total,
      CASE WHEN p.donation < 0 THEN p.donation ELSE 0 END "discount",
      CASE WHEN p.donation >= 0 THEN p.donation ELSE 0 END "donation",
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

    UNION ALL
	
    SELECT c.id, 
      c."createdAt", 
      c."updatedAt", 
      CASE 
        WHEN (c."fullyRefunded" OR c."amountRefunded" > 0) THEN 'refunded' 
        ELSE c."status"::text 
        END "status", 
      c.provider::text "method", -- might need to be changed to "paymentMethodType" depending on how the booking works between paypal and stripe
      c.company::text "companyName",
      i.total, 
      0-i."totalDiscountAmount" "discount",
      COALESCE(
      	SUM(ol.price) FILTER (WHERE ol.description = 'Freiwilliger Beitrag'), -- hardcoded for Freiwilliger Beitrag in oderLineItems
      	CASE WHEN s.type = 'MONTHLY_SUBSCRIPTION' THEN i."totalBeforeDiscount" - 2200 -- if no orderLineItems entry (before May 2025) then use hardcoded subscription prices, before that date no paying more was possible
      	WHEN s.type = 'YEARLY_SUBSCRIPTION' THEN i."totalBeforeDiscount" - 24000 END) 
      	"donation",
      s.type::text "packageName",
      'MembershipType' "type",
      1 "amount", -- could be inferred from invoice items ->> quantity but it's not possible to buy multiple subscriptions or other goods at the moment
      1 "periods", -- could be inferred from type and invoice period start and end but it's not possible to buy multiple periods at the moment
      i."totalBeforeDiscount" "price"

    FROM payments."charges" c
    INNER JOIN payments."invoices" i ON c."invoiceId" = i.id 
    INNER JOIN payments."subscriptions" s ON i."subscriptionId" = s.id 
    INNER JOIN payments.orders o ON o."subscriptionId" = s.id 
    LEFT JOIN payments."orderLineItems" ol ON ol."orderId" = o.id 
    
    WHERE
        (
          c."createdAt" AT TIME ZONE 'Europe/Zurich' BETWEEN '${begin.format(
          'YYYY-MM-DD',
        )}' AND '${end.format('YYYY-MM-DD')}'
          OR c."updatedAt" AT TIME ZONE 'Europe/Zurich' BETWEEN '${begin.format(
          'YYYY-MM-DD',
        )}' AND '${end.format('YYYY-MM-DD')}'
        )

    GROUP BY c.id, i.id, s.id, o.id

    UNION ALL

    SELECT o.id, 
      o."createdAt", 
      o."updatedAt", 
      'succeeded' "status", -- not yet saved in charges so we don't know if the charge was refunded
      'STRIPE' "method", -- we don't know the provider because it's not saved in charges
      o.company::text "companyName",
      ol.price "total", 
      0-ol."discountAmount" "discount", -- should always be 0 for single donations
      ol.price "donation", -- the full price is a donation for donations
      'DONATE' "packageName", -- hardcoded
      'MembershipType' "type", -- not a goodie
      1 "amount", -- ->> quantity but it's not possible to buy multiple donations at the moment
      1 "periods", -- not applicable
      ol."priceSubtotal" "price"

    FROM payments.orders o 
    JOIN payments."orderLineItems" ol ON ol."orderId" = o.id 
    
    WHERE
        (
          o."createdAt" AT TIME ZONE 'Europe/Zurich' BETWEEN '${begin.format(
          'YYYY-MM-DD',
        )}' AND '${end.format('YYYY-MM-DD')}'
          OR o."updatedAt" AT TIME ZONE 'Europe/Zurich' BETWEEN '${begin.format(
          'YYYY-MM-DD',
        )}' AND '${end.format('YYYY-MM-DD')}'
        )
    AND o."invoiceId" IS NULL
    ;
  `

  // console.log(query)

  const transactionItems = await pgdb.query(query)

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
        .filter((i) => isCancelledOrRefunded(i))

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
        (m) => m.discount < 0,
      )

      results.ReduzierteMitgliedschaften = {
        Betrag:
          ReduzierteMitgliedschaften.map(
            (m) => m.amount * (m.periods || 1) * m.discount,
          ).reduce((p, c) => p + c, 0) / 100,
      }

      /**
       * Stornierte, reduzierte Mitgliedschaften
       */

      const StornierteReduzierteMitgliedschaften =
        StornierteMitgliedschaften.filter((m) => m.discount < 0)

      results.StornierteReduzierteMitgliedschaften = {
        Betrag:
          StornierteReduzierteMitgliedschaften.map(
            (m) => m.amount * (m.periods || 1) * m.discount,
          ).reduce((p, c) => p - c, 0) / 100,
      }

      /**
       * Gönner-Mitgliedschaften
       */

      const GoennerMitgliedschaften = Mitgliedschaften.filter(
        (i) => isBenefactorSubscriptionOrMembership(i),
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
          (i) => isBenefactorSubscriptionOrMembership(i),
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
        .filter((i) => isCancelledOrRefunded(i))

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
        .filter((i) => ['MONTHLY_ABO', 'MONTHLY_SUBSCRIPTION'].includes(i.packageName))
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
        .filter((i) => ['MONTHLY_ABO', 'MONTHLY_SUBSCRIPTION'].includes(i.packageName))
        .filter((i) => i.type === 'MembershipType')
        .filter((i) => isCancelledOrRefunded(i))

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
       * Reduzierte Abonnements
       */

      const ReduzierteAbonnements = Abonnements.filter(
        (m) => m.discount < 0,
      )

      results.ReduzierteAbonnements = {
        Betrag:
        ReduzierteAbonnements.map(
            (m) => m.amount * (m.periods || 1) * m.discount,
          ).reduce((p, c) => p + c, 0) / 100,
      }

      /**
       * Stornierte, reduzierte Abonnements
       */

      const StornierteReduzierteAbonnements =
        StornierteAbonnements.filter((m) => m.discount < 0)

      results.StornierteReduzierteAbonnements = {
        Betrag:
        StornierteReduzierteAbonnements.map(
            (m) => m.amount * (m.periods || 1) * m.discount,
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
        .filter((i) => isCancelledOrRefunded(i))

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

      const JahresabonnementsWithPrecomputed = precomputeTransitoryLiabilities(Jahresabonnements, endFiscalYear)

      results.JahresabonnementsAktuellesGeschaeftsjahr = {
        Betrag:
        JahresabonnementsWithPrecomputed.map((a) => a.precomputed.totalFiscalYear).reduce(
            (p, c) => p + c,
            0,
          ) / 100,
      }
      results.JahresabonnementsTransitorischePassive = {
        Betrag:
        JahresabonnementsWithPrecomputed.map(
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
        .filter((i) => isCancelledOrRefunded(i))

      const StornierteJahresabonnementsWithPrecomputed = precomputeTransitoryLiabilities(StornierteJahresabonnements, endFiscalYear)

      const stornierteJahresabonnementsResults = calculateCancelledYearlyAbos(
        StornierteJahresabonnementsWithPrecomputed,
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
      .filter((i) => isCancelledOrRefunded(i))

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


