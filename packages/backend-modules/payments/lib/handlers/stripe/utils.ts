import { Company, SubscriptionType } from '../../types'

export function getSubscriptionType(company: Company): SubscriptionType {
  switch (company) {
    case 'REPUBLIK':
      return 'MONTHLY_SUBSCRIPTION'
    case 'PROJECT_R':
      return 'YEARLY_SUBSCRIPTION'
  }
}
