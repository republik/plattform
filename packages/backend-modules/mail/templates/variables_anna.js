export const new_vars = {
  recipientIsNotGranter: `RECIPIENT_EMAIL != GRANTER_EMAIL`,
  isRepublikMember: `active_membership_type_company_name == "REPUBLIK"`,
  hasMonthlyAbo: `membership_type_interval == "month"`,
  thirdAttempt: `attempt_number == 3`,
  fourthAttempt: `attempt_number == 4`,
}
