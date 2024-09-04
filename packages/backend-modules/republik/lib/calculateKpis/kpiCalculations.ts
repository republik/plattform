import { Dayjs } from 'dayjs'

type CancelledYearyAboResults = {
  StornierteJahresabonnementsAktuellesGeschaeftsjahr: {
    Betrag: number
  }
  StornierteJahresabonnementsTransitorischePassive: {
    Betrag: number
  }
}

export type YearlyAbo = {
  createdAt: Date
  updatedAt: Date
  total: number
}

export type YearlyAboPrecomputed = YearlyAbo & {
  precomputed: { totalFiscalYear: number; totalTransitoryLiabilities: number }
}

/**
 * precompute distribution of yearly abo total between current fiscal year and transitory liabilities
 * @param yearlyAbos 
 * @param endFiscalYear 
 * @returns 
 */
export function precomputeTransitoryLiabilities(yearlyAbos: YearlyAbo[], endFiscalYear: Dayjs) {
  return yearlyAbos.map((i) => {
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
}

export function calculateCancelledYearlyAbos(
  StornierteJahresabonnements: YearlyAboPrecomputed[],
  endFiscalYear: Dayjs,
): CancelledYearyAboResults {
  const year = endFiscalYear.get('year')
  let endLastFiscalYear = endFiscalYear
  endLastFiscalYear = endLastFiscalYear.set('year', year - 1)

  const StornierteJahresabonnementsLetztesGeschaeftsjahr =
    StornierteJahresabonnements.filter(
      (a) =>
        endLastFiscalYear.isAfter(a.createdAt) &&
        endLastFiscalYear.isBefore(a.updatedAt),
    )

  const StornierteJahresabonnementsGleichesGeschaeftsjahr =
    StornierteJahresabonnements.filter(
      (a) =>
        !(
          endLastFiscalYear.isAfter(a.createdAt) &&
          endLastFiscalYear.isBefore(a.updatedAt)
        ),
    )

  // total goes into aktuelles Geschäftsjahr, because the abonnements
  // were bought in last fiscal year and cancelled in the current fiscal year
  const betragStornierteJahresabonnementsLetztesGJ =
    StornierteJahresabonnementsLetztesGeschaeftsjahr.map((a) => a.total).reduce(
      (p, c) => p - c,
      0,
    ) / 100

  // only the part for the current fiscal year goes into the current fiscal year. the rest in transitorische passive
  const betragStornierteJahresabonnementsGleichesGJ =
    StornierteJahresabonnementsGleichesGeschaeftsjahr.map(
      (a) => a.precomputed.totalFiscalYear,
    ).reduce((p, c) => p - c, 0) / 100

  const results = {
    StornierteJahresabonnementsAktuellesGeschaeftsjahr: {
      Betrag:
        betragStornierteJahresabonnementsGleichesGJ +
        betragStornierteJahresabonnementsLetztesGJ,
    },
    StornierteJahresabonnementsTransitorischePassive: {
      Betrag:
        StornierteJahresabonnementsGleichesGeschaeftsjahr.map(
          (a) => a.precomputed.totalTransitoryLiabilities,
        ).reduce((p, c) => p - c, 0) / 100,
    }
  }
  return results
}
