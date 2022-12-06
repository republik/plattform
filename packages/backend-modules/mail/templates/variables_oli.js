export const new_vars = {
  'this.hasMultipleOAmounts': `this.oamount > 1.`,
  hasAnyPledgeMemberships: `pledger_memberships_count > 0.`,
  hasOneGiftedMembership: `gifted_memberships_count == 1.`,
  hasMultipleGiftedMemberships: `gifted_memberships_count > 1.`,
  hasOneGoodie: `goodies_count == 1.`,
  hasMultipleGoodies: `goodies_count > 1.`,
  isOTypeGoodie: `this.otype == "Goodie".`,
  hasAnyGrantedMemberships: `num_access_granted_memberships > 0.`,
  hasOneGrantedMemberships: `num_access_granted_memberships == 1.`,
  hasMultipleGrantedMemberships: `num_access_granted_memberships > 1.`,
  totalPledgeAbove1000: `total > 1000`,
  totalPledgeBelow1000: `total < 1000`,
}
