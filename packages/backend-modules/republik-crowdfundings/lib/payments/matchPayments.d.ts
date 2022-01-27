export interface MatchPaymentReport {
  numMatchedPayments: number
  numUpdatedPledges: number
  numPaymentsSuccessful: number
}

declare function _exports(
  transaction: any,
  t: any,
  redis: any,
): Promise<MatchPaymentReport>
export = _exports
