import dayjs from 'dayjs'
import { calculateCancelledYearlyAbos, precomputeTransitoryLiabilities, YearlyAbo, YearlyAboPrecomputed } from '../../../lib/calculateKpis/kpiCalculations'

describe('distribution of yearly abo totals between current and next fiscal year', () => {
  const endFiscalYear = dayjs('2025-06-30T21:59:59.999Z')
  const yearlyAbos: YearlyAbo[] = [
    {createdAt: new Date('2024-07-01'), updatedAt: new Date('2024-07-01'), total: 12000},
    {createdAt: new Date('2024-08-01'), updatedAt: new Date('2024-08-01'), total: 12000}
  ]
  const results = precomputeTransitoryLiabilities(yearlyAbos, endFiscalYear)
  expect(results[0].precomputed.totalFiscalYear).toBe(11967)
  expect(results[0].precomputed.totalTransitoryLiabilities).toBe(33)
  expect(results[1].precomputed.totalFiscalYear).toBe(10948)
  expect(results[1].precomputed.totalTransitoryLiabilities).toBe(1052)
})

describe('cancelled yearly abos', () => {
  const endFiscalYear = dayjs('2025-06-30T21:59:59.999Z')
  

  test('only yearly abos that were bought and cancelled in the same fiscal year', () => {
    const yearlyAbos: YearlyAboPrecomputed[] = precomputeTransitoryLiabilities([
      {createdAt: new Date('2024-07-01'), updatedAt: new Date('2024-08-01'), total: 12000},
      {createdAt: new Date('2024-08-01'), updatedAt: new Date('2024-09-01'), total: 12000}
    ], endFiscalYear)
    const results = calculateCancelledYearlyAbos(yearlyAbos, endFiscalYear)
    expect(results.StornierteJahresabonnementsAktuellesGeschaeftsjahr.Betrag).toBe(-(119.67 + 109.48))
    expect(results.StornierteJahresabonnementsTransitorischePassive.Betrag).toBe(-(.33 + 10.52))
  })

  test('only yearly abos that were bought and cancelled in different fiscal years', () => {
    const yearlyAbos: YearlyAboPrecomputed[] = precomputeTransitoryLiabilities([
      {createdAt: new Date('2024-06-01'), updatedAt: new Date('2024-08-01'), total: 12000},
      {createdAt: new Date('2024-05-01'), updatedAt: new Date('2024-09-01'), total: 12000}
    ], endFiscalYear)
    const results = calculateCancelledYearlyAbos(yearlyAbos, endFiscalYear)
    expect(results.StornierteJahresabonnementsAktuellesGeschaeftsjahr.Betrag).toBe(-(120 + 120))
    expect(results.StornierteJahresabonnementsTransitorischePassive.Betrag).toBe(0)
  })

  test('mixed cancelled yearly abos', () => {
    const yearlyAbos: YearlyAboPrecomputed[] = precomputeTransitoryLiabilities([
      {createdAt: new Date('2024-06-01'), updatedAt: new Date('2024-08-01'), total: 12000},
      {createdAt: new Date('2024-08-01'), updatedAt: new Date('2024-09-01'), total: 12000}
    ], endFiscalYear)
    const results = calculateCancelledYearlyAbos(yearlyAbos, endFiscalYear)
    expect(results.StornierteJahresabonnementsAktuellesGeschaeftsjahr.Betrag).toBe(-(120 + 109.48))
    expect(results.StornierteJahresabonnementsTransitorischePassive.Betrag).toBe(-(0 + 10.52))
  })
})
