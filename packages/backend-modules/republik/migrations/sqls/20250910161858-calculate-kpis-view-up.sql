-- migrate up here: CREATE TABLE...
CREATE OR REPLACE VIEW calculate_kpis_pledges AS

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
      r.type::text,
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
    
    WHERE po.amount > 0

    GROUP BY pay.id, c.id, p.id, pkgs.id, r.id, po.id
;

CREATE OR REPLACE VIEW calculate_kpis_subscriptions AS

SELECT c.id, 
      c."createdAt" AT TIME ZONE 'Europe/Zurich' "createdAt", 
      c."updatedAt" AT TIME ZONE 'Europe/Zurich' "updatedAt", 
      CASE 
        WHEN (c."fullyRefunded" OR c."amountRefunded" > 0) THEN 'refunded' 
        ELSE c."status"::text 
        END "status", 
      c.provider::text "method", -- is okay as provider according to Dedi, does not need to have the paymentMethodType
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

    GROUP BY c.id, i.id, s.id, o.id;

CREATE OR REPLACE VIEW calculate_kpis_shop_donations AS

SELECT COALESCE(c.id, o.id) "id", 
      COALESCE(c."createdAt" AT TIME ZONE 'Europe/Zurich', o."createdAt" AT TIME ZONE 'Europe/Zurich') "createdAt", 
      COALESCE(c."updatedAt" AT TIME ZONE 'Europe/Zurich', o."updatedAt" AT TIME ZONE 'Europe/Zurich') "updatedAt", 
      COALESCE(c.status::text, 'succeeded') "status", -- not yet saved in charges so we don't know if the charge was refunded
      COALESCE(c.provider::text, 'STRIPE') "method", -- is okay as provider according to Dedi, does not need to have the paymentMethodType
      o.company::text "companyName",
      ol.price "total", 
      0-ol."discountAmount" "discount", -- should always be 0 for single donations
      ol.price "donation", -- the full price is a donation for donations
      'DONATE' "packageName", -- hardcoded
      NULL "type", -- not a goodie nor a membership
      1 "amount", -- ->> quantity but it's not possible to buy multiple donations at the moment
      1 "periods", -- not applicable
      ol."priceSubtotal" "price"

    FROM payments.orders o 
    JOIN payments."orderLineItems" ol ON ol."orderId" = o.id
    LEFT JOIN payments.charges c ON c."paymentIntentId" = o."paymentIntentId"
    
    WHERE o."invoiceId" IS NULL;
