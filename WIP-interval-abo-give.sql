BEGIN TRANSACTION ;

-- Add a new reward of type "MembershipType"
INSERT INTO "rewards"("id","type")
VALUES
(E'f6a05b57-e876-4e67-b14a-c4b7cefc6f16',E'MembershipType')
;

-- Add a new MembershpType, named "ABO_GIVE_MONTHS"
INSERT INTO "membershipTypes"("id","rewardId","rewardType","name","price","companyId","interval","minIntervalCount","maxIntervalCount","defaultIntervalCount","intervalStepCount")
VALUES
(E'21242c12-e8b1-4631-8d97-5bc480858a11',E'f6a05b57-e876-4e67-b14a-c4b7cefc6f16',E'MembershipType',E'ABO_GIVE_MONTHS',2200,E'240ef27d-cf26-48c1-81df-54b2a10732f4',E'month',1,9,3,1);

-- Add package "ABO_GIVE_MONTHS"
INSERT INTO "packages"("id","crowdfundingId","name","companyId","paymentMethods","isAutoActivateUserMembership","custom","rules","order")
VALUES
(E'f03cabcc-fea3-4c80-b0a2-500064fe3180',E'e2ea1234-ca8c-4604-aeec-80a0cecf07bf',E'ABO_GIVE_MONTHS',E'240ef27d-cf26-48c1-81df-54b2a10732f4',E'{STRIPE,POSTFINANCECARD,PAYPAL}',FALSE,FALSE,E'[]',600);

-- Add packageOptions for package "ABO_GIVE_MONTHS"
INSERT INTO "packageOptions"("id","packageId","rewardId","minAmount","maxAmount","defaultAmount","price","userPrice","minUserPrice","vat","order")
VALUES
(E'601ecae5-3e8d-4af3-b45f-21684fb87a13',E'f03cabcc-fea3-4c80-b0a2-500064fe3180',E'f6a05b57-e876-4e67-b14a-c4b7cefc6f16',1,100,1,2200,FALSE,0,0,100),
(E'22bab656-76bd-4482-af71-f7fddc7aa7c8',E'f03cabcc-fea3-4c80-b0a2-500064fe3180',E'43f69dbd-dca9-40a0-82d4-5ed431cb7278',0,100,0,2000,FALSE,0,0,200),
(E'226ef3f0-9738-451e-9157-0552150c1257',E'f03cabcc-fea3-4c80-b0a2-500064fe3180',E'00b84bff-9b49-4ca7-b6d7-760783b49bf3',0,100,0,2000,FALSE,0,0,300);

COMMIT TRANSACTION ;
