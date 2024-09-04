import { Dayjs } from 'dayjs'

type CancelledYearyAboResults = {
  StornierteJahresabonnementsAktuellesGeschaeftsjahr: {
    Betrag: number
  }
  StornierteJahresabonnementsTransitorischePassive: {
    Betrag: number
  }
}

type CancelledYearlyAbo = {
  createdAt: Date
  updatedAt: Date
  total: number
  precomputed: { totalFiscalYear: number; totalTransitoryLiabilities: number }
}

export function calculateCancelledYearlyAbos(
  StornierteJahresabonnements: CancelledYearlyAbo[],
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
