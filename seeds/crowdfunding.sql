--
-- PostgreSQL database dump
--

-- Dumped from database version 10.1
-- Dumped by pg_dump version 10.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET search_path = public, pg_catalog;

--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: patte
--

DELETE FROM companies CASCADE;
DELETE FROM crowdfundings;
DELETE FROM rewards CASCADE;
DELETE FROM goodies CASCADE;
DELETE FROM packages CASCADE;
INSERT INTO companies (id, name, "createdAt", "updatedAt", title) VALUES ('a39ed529-cb41-497f-826d-4d8cf5ccd483', 'PROJECT_R', '2017-12-11 22:48:40.440096+01', '2017-12-11 22:48:40.440096+01', NULL);
INSERT INTO companies (id, name, "createdAt", "updatedAt", title) VALUES ('ee5f7aa3-9083-4738-86c9-91fd8757b7aa', 'REPUBLIK', '2017-12-11 22:48:40.440096+01', '2017-12-11 22:48:40.440096+01', NULL);
INSERT INTO companies (id, name, "createdAt", "updatedAt", title) VALUES ('8f703369-1c07-4589-821f-c551041fc71a', 'name1', '2017-12-15 17:16:18.653879+01', '2017-12-15 17:16:18.653879+01', 'title1');


--
-- Data for Name: crowdfundings; Type: TABLE DATA; Schema: public; Owner: patte
--

INSERT INTO crowdfundings (id, name, "beginDate", "endDate", "createdAt", "updatedAt", result) VALUES ('2fd24f48-979f-42c7-abd6-43bdc33dea4a', 'REPUBLIK', '2017-04-26 08:00:00+02', '2017-05-31 19:59:59.999+02', '2017-04-26 05:18:09.192+02', '2017-04-26 05:18:09.192+02', '{"status": {"money": 345018300, "people": 13845}, "endVideo": {"hls": "https://player.vimeo.com/external/219716065.m3u8?s=e0e06e78ea4d23eb9f0fa5659c0e967eb7ad5f4d", "mp4": "https://player.vimeo.com/external/219716065.hd.mp4?s=2042592908d5176d8009e7580ffb2cb1802c8e17&profile_id=119", "poster": "https://assets.republik.ch/cf_gui/static/video/merci.png", "subtitles": "/static/subtitles/merci.vtt"}}');
INSERT INTO crowdfundings (id, name, "beginDate", "endDate", "createdAt", "updatedAt", result) VALUES ('5584de60-b93b-483a-9110-13f731d94699', 'PRESALE', '2017-07-24 08:00:00+02', '2018-01-14 07:00:00+01', '2017-07-24 11:16:57.721+02', '2017-07-24 11:16:57.721+02', NULL);
INSERT INTO crowdfundings (id, name, "beginDate", "endDate", "createdAt", "updatedAt", result) VALUES ('2cd14f7f-a46e-4578-9541-716ab7b2641e', 'LAUNCH', '2017-12-11 22:48:59.971+01', '2019-01-15 07:00:00+01', '2017-12-11 22:48:59.97106+01', '2017-12-11 22:48:59.97106+01', NULL);


--
-- Data for Name: crowdfundingGoals; Type: TABLE DATA; Schema: public; Owner: patte
--

INSERT INTO "crowdfundingGoals" (id, "crowdfundingId", name, people, money, description, "createdAt", "updatedAt") VALUES ('952f2cb7-650e-4166-92e4-33f15075b81b', '2fd24f48-979f-42c7-abd6-43bdc33dea4a', 'ONLY_THE_BEGINNING', 3000, 75000000, 'Dank Ihnen haben wir unser Ziel von 3000 Mitgliedern erreicht! Wir gehen 2018 definitiv an den Start!', '2017-04-26 05:18:09.202+02', '2017-05-28 20:04:18.552+02');
INSERT INTO "crowdfundingGoals" (id, "crowdfundingId", name, people, money, description, "createdAt", "updatedAt") VALUES ('326e6102-6634-4fc3-ada5-4817b73cff74', '2fd24f48-979f-42c7-abd6-43bdc33dea4a', 'SG1', 5000, 75000000, 'Dank Ihnen haben wir unser nächstes Ziel von 5000 Unterstützerinnen erreicht. Und schaffen zwei zusätzliche Ausbildungsplätze für junge Journalistinnen und Journalisten.', '2017-04-26 14:49:42.679463+02', '2017-05-28 20:04:18.559+02');
INSERT INTO "crowdfundingGoals" (id, "crowdfundingId", name, people, money, description, "createdAt", "updatedAt") VALUES ('85d36841-9b7d-4727-9732-8d769edbb27b', '2fd24f48-979f-42c7-abd6-43bdc33dea4a', 'SG2', 7000, 75000000, 'Wir haben 7000 Unterstützerinnen und Unterstützer erreicht und erhöhen die Zahl der Köpfe in der geplanten Redaktion von 10 auf 11. Danke!', '2017-04-26 21:38:12.442182+02', '2017-05-28 20:04:18.564+02');
INSERT INTO "crowdfundingGoals" (id, "crowdfundingId", name, people, money, description, "createdAt", "updatedAt") VALUES ('b2b4b7fb-2465-4160-8b23-918ed3e85cd2', '2fd24f48-979f-42c7-abd6-43bdc33dea4a', 'SG3', 9000, 75000000, 'Wow! Gemeinsam haben wir auch das Ziel von 9000 Unterstützerinnen und Unterstützern geschafft. Wir werden dank eurer Unterstützung 2018 vier grosse Recherchen mit einem Gesamtbudget von 250 000 Franken anstossen und realisieren.', '2017-04-27 14:29:29.706197+02', '2017-05-28 20:04:18.569+02');
INSERT INTO "crowdfundingGoals" (id, "crowdfundingId", name, people, money, description, "createdAt", "updatedAt") VALUES ('0f198322-705c-41b7-b47b-f4100c278574', '2fd24f48-979f-42c7-abd6-43bdc33dea4a', 'SG4', 10000, 75000000, 'Ziel erreicht – 10 000 Unterstützer! Danke! Damit haben wir gemeinsam mit Ihnen ein fixes Budget geschaffen, um herausragende internationale Autorinnen und Autoren für die Republik zu gewinnen.', '2017-04-29 09:28:21.611083+02', '2017-05-28 20:04:18.575+02');
INSERT INTO "crowdfundingGoals" (id, "crowdfundingId", name, people, money, description, "createdAt", "updatedAt") VALUES ('585b4ac6-e3a3-40b4-aee8-2dbb5121b1d9', '2fd24f48-979f-42c7-abd6-43bdc33dea4a', 'SG5', 12000, 75000000, '12 000 Unterstützerinnen! Damit haben wir gemeinsam mehr als die Hälfte der 22 000 Abonnenten geschafft, die nötig sind, bis die Republik selbsttragend funktioniert. Danke!', '2017-05-01 12:11:42.292086+02', '2017-05-28 20:04:18.581+02');
INSERT INTO "crowdfundingGoals" (id, "crowdfundingId", name, people, money, description, "createdAt", "updatedAt") VALUES ('432d8833-8dfa-41bc-9a13-ab6ec3386adc', '2fd24f48-979f-42c7-abd6-43bdc33dea4a', 'SG6', 14000, 75000000, 'Das Crowdfunding läuft noch bis am 31. Mai um 20 Uhr. Das nächste Ziel bei 14 000 Unterstützern haben unsere Verlegerinnen und Verleger in einer Abstimmung bestimmt: den Ausbau des Datenjournalismus-Teams. Sie sind noch nicht Verlegerin der ersten Stunde? Danke fürs Mitmachen und Weitersagen!', '2017-05-18 11:48:38.502307+02', '2017-05-28 20:04:18.586+02');
INSERT INTO "crowdfundingGoals" (id, "crowdfundingId", name, people, money, description, "createdAt", "updatedAt") VALUES ('d129153e-7f3d-4ee9-878f-a2399a60da8b', '5584de60-b93b-483a-9110-13f731d94699', 'SUSTAINABLE', 7000, 360000000, NULL, '2017-07-24 11:16:57.721+02', '2017-07-24 11:16:57.721+02');


--
-- Data for Name: rewards; Type: TABLE DATA; Schema: public; Owner: patte
--

INSERT INTO rewards (id, type, "createdAt", "updatedAt") VALUES ('43f69dbd-dca9-40a0-82d4-5ed431cb7278', 'Goodie', '2017-04-26 05:18:09.21+02', '2017-04-26 05:18:09.21+02');
INSERT INTO rewards (id, type, "createdAt", "updatedAt") VALUES ('3837d7e2-8b8e-4e9a-8106-4de5aacedbcd', 'MembershipType', '2017-04-26 05:18:09.219+02', '2017-04-26 05:18:09.219+02');
INSERT INTO rewards (id, type, "createdAt", "updatedAt") VALUES ('5d4ab411-8a26-40dd-8a4f-f59cbfc9503f', 'MembershipType', '2017-04-26 05:18:09.23+02', '2017-04-26 05:18:09.23+02');
INSERT INTO rewards (id, type, "createdAt", "updatedAt") VALUES ('00b84bff-9b49-4ca7-b6d7-760783b49bf3', 'Goodie', '2017-11-21 23:26:21.680285+01', '2017-11-21 23:26:21.680285+01');
INSERT INTO rewards (id, type, "createdAt", "updatedAt") VALUES ('003a5596-a797-4818-b0bc-a8347917561a', 'MembershipType', '2017-12-11 22:48:59.97106+01', '2017-12-11 22:48:59.97106+01');


--
-- Data for Name: goodies; Type: TABLE DATA; Schema: public; Owner: patte
--

INSERT INTO goodies (id, "rewardId", "rewardType", name, "createdAt", "updatedAt") VALUES ('d6494b6e-2d53-4d3a-bfe7-34884778f708', '43f69dbd-dca9-40a0-82d4-5ed431cb7278', 'Goodie', 'NOTEBOOK', '2017-04-26 05:18:09.215+02', '2017-04-26 05:18:09.215+02');
INSERT INTO goodies (id, "rewardId", "rewardType", name, "createdAt", "updatedAt") VALUES ('1b841cbc-b620-4771-9d26-25193319df37', '00b84bff-9b49-4ca7-b6d7-760783b49bf3', 'Goodie', 'TOADBAG', '2017-11-21 23:26:21.680285+01', '2017-11-21 23:26:21.680285+01');


--
-- Data for Name: membershipTypes; Type: TABLE DATA; Schema: public; Owner: patte
--

INSERT INTO "membershipTypes" (id, "rewardId", "rewardType", name, price, "createdAt", "updatedAt", "companyId", "interval", "intervalCount") VALUES ('ef0f787a-34b5-4494-80f6-18831799aaaa', '3837d7e2-8b8e-4e9a-8106-4de5aacedbcd', 'MembershipType', 'ABO', 24000, '2017-04-26 05:18:09.224+02', '2017-04-26 05:18:09.224+02', 'a39ed529-cb41-497f-826d-4d8cf5ccd483', 'year', 1);
INSERT INTO "membershipTypes" (id, "rewardId", "rewardType", name, price, "createdAt", "updatedAt", "companyId", "interval", "intervalCount") VALUES ('8ecd1d10-1519-4382-a401-5ec10bbec181', '5d4ab411-8a26-40dd-8a4f-f59cbfc9503f', 'MembershipType', 'BENEFACTOR_ABO', 24000, '2017-04-26 05:18:09.233+02', '2017-04-26 05:18:09.233+02', 'a39ed529-cb41-497f-826d-4d8cf5ccd483', 'year', 1);
INSERT INTO "membershipTypes" (id, "rewardId", "rewardType", name, price, "createdAt", "updatedAt", "companyId", "interval", "intervalCount") VALUES ('1a46aa20-5b0a-4f3b-828b-96392f86fd41', '003a5596-a797-4818-b0bc-a8347917561a', 'MembershipType', 'MONTHLY_ABO', 2000, '2017-12-11 22:48:59.97106+01', '2017-12-11 22:48:59.97106+01', 'ee5f7aa3-9083-4738-86c9-91fd8757b7aa', 'day', 1);


--
-- Data for Name: packages; Type: TABLE DATA; Schema: public; Owner: patte
--

INSERT INTO packages (id, "crowdfundingId", name, "createdAt", "updatedAt", "companyId", "paymentMethods") VALUES ('bb88bb15-0471-4c43-b3c4-8d1ee4c8b615', '2fd24f48-979f-42c7-abd6-43bdc33dea4a', 'ABO', '2017-04-26 05:18:09.238+02', '2017-04-26 05:18:09.238+02', 'a39ed529-cb41-497f-826d-4d8cf5ccd483', '{STRIPE,POSTFINANCECARD,PAYPAL,PAYMENTSLIP}');
INSERT INTO packages (id, "crowdfundingId", name, "createdAt", "updatedAt", "companyId", "paymentMethods") VALUES ('81a32c97-d220-4289-80fa-a34d04495689', '2fd24f48-979f-42c7-abd6-43bdc33dea4a', 'ABO_GIVE', '2017-04-26 05:18:09.251+02', '2017-04-26 05:18:09.251+02', 'a39ed529-cb41-497f-826d-4d8cf5ccd483', '{STRIPE,POSTFINANCECARD,PAYPAL,PAYMENTSLIP}');
INSERT INTO packages (id, "crowdfundingId", name, "createdAt", "updatedAt", "companyId", "paymentMethods") VALUES ('15bc4bc9-dca5-4660-aea0-341afd55cd59', '2fd24f48-979f-42c7-abd6-43bdc33dea4a', 'BENEFACTOR', '2017-04-26 05:18:09.266+02', '2017-04-26 05:18:09.266+02', 'a39ed529-cb41-497f-826d-4d8cf5ccd483', '{STRIPE,POSTFINANCECARD,PAYPAL,PAYMENTSLIP}');
INSERT INTO packages (id, "crowdfundingId", name, "createdAt", "updatedAt", "companyId", "paymentMethods") VALUES ('0fa44439-402c-42b6-815a-834c03285a39', '2fd24f48-979f-42c7-abd6-43bdc33dea4a', 'DONATE', '2017-04-26 05:18:09.276+02', '2017-04-26 05:18:09.276+02', 'a39ed529-cb41-497f-826d-4d8cf5ccd483', '{STRIPE,POSTFINANCECARD,PAYPAL,PAYMENTSLIP}');
INSERT INTO packages (id, "crowdfundingId", name, "createdAt", "updatedAt", "companyId", "paymentMethods") VALUES ('0a3c6c71-bc0a-436a-9b8c-1b04e8ebfd27', '5584de60-b93b-483a-9110-13f731d94699', 'ABO', '2017-07-24 11:16:57.721+02', '2017-07-24 11:16:57.721+02', 'a39ed529-cb41-497f-826d-4d8cf5ccd483', '{STRIPE,POSTFINANCECARD,PAYPAL,PAYMENTSLIP}');
INSERT INTO packages (id, "crowdfundingId", name, "createdAt", "updatedAt", "companyId", "paymentMethods") VALUES ('73dc795a-461d-47e7-a572-76c39cc4d367', '5584de60-b93b-483a-9110-13f731d94699', 'ABO_GIVE', '2017-07-24 11:16:57.721+02', '2017-07-24 11:16:57.721+02', 'a39ed529-cb41-497f-826d-4d8cf5ccd483', '{STRIPE,POSTFINANCECARD,PAYPAL,PAYMENTSLIP}');
INSERT INTO packages (id, "crowdfundingId", name, "createdAt", "updatedAt", "companyId", "paymentMethods") VALUES ('44681937-2cfe-4caf-a766-e41a59948325', '5584de60-b93b-483a-9110-13f731d94699', 'BENEFACTOR', '2017-07-24 11:16:57.721+02', '2017-07-24 11:16:57.721+02', 'a39ed529-cb41-497f-826d-4d8cf5ccd483', '{STRIPE,POSTFINANCECARD,PAYPAL,PAYMENTSLIP}');
INSERT INTO packages (id, "crowdfundingId", name, "createdAt", "updatedAt", "companyId", "paymentMethods") VALUES ('c2a226ad-7267-4144-8946-37d8076b5468', '5584de60-b93b-483a-9110-13f731d94699', 'DONATE', '2017-07-24 11:16:57.721+02', '2017-07-24 11:16:57.721+02', 'a39ed529-cb41-497f-826d-4d8cf5ccd483', '{STRIPE,POSTFINANCECARD,PAYPAL,PAYMENTSLIP}');
INSERT INTO packages (id, "crowdfundingId", name, "createdAt", "updatedAt", "companyId", "paymentMethods") VALUES ('2fe2650d-7bdf-41e1-adc3-e69288c5f7eb', '2cd14f7f-a46e-4578-9541-716ab7b2641e', 'ABO', '2017-12-11 22:48:59.971+01', '2017-12-11 22:48:59.971+01', 'a39ed529-cb41-497f-826d-4d8cf5ccd483', '{STRIPE,POSTFINANCECARD,PAYPAL,PAYMENTSLIP}');
INSERT INTO packages (id, "crowdfundingId", name, "createdAt", "updatedAt", "companyId", "paymentMethods") VALUES ('7884ba68-f495-4e9b-bd0c-c051317be138', '2cd14f7f-a46e-4578-9541-716ab7b2641e', 'ABO_GIVE', '2017-12-11 22:48:59.971+01', '2017-12-11 22:48:59.971+01', 'a39ed529-cb41-497f-826d-4d8cf5ccd483', '{STRIPE,POSTFINANCECARD,PAYPAL,PAYMENTSLIP}');
INSERT INTO packages (id, "crowdfundingId", name, "createdAt", "updatedAt", "companyId", "paymentMethods") VALUES ('9334ee53-44fe-476f-b9f8-dc32d147bab6', '2cd14f7f-a46e-4578-9541-716ab7b2641e', 'BENEFACTOR', '2017-12-11 22:48:59.971+01', '2017-12-11 22:48:59.971+01', 'a39ed529-cb41-497f-826d-4d8cf5ccd483', '{STRIPE,POSTFINANCECARD,PAYPAL,PAYMENTSLIP}');
INSERT INTO packages (id, "crowdfundingId", name, "createdAt", "updatedAt", "companyId", "paymentMethods") VALUES ('4d9e214c-9452-40c6-a38b-93be2e2c7c2a', '2cd14f7f-a46e-4578-9541-716ab7b2641e', 'DONATE', '2017-12-11 22:48:59.971+01', '2017-12-11 22:48:59.971+01', 'a39ed529-cb41-497f-826d-4d8cf5ccd483', '{STRIPE,POSTFINANCECARD,PAYPAL,PAYMENTSLIP}');
INSERT INTO packages (id, "crowdfundingId", name, "createdAt", "updatedAt", "companyId", "paymentMethods") VALUES ('eab63f72-fa7d-4f69-b32c-a4157683cdc8', '2cd14f7f-a46e-4578-9541-716ab7b2641e', 'MONTHLY_ABO', '2017-12-11 22:48:59.97106+01', '2017-12-11 22:48:59.97106+01', 'ee5f7aa3-9083-4738-86c9-91fd8757b7aa', '{STRIPE}');


--
-- Data for Name: packageOptions; Type: TABLE DATA; Schema: public; Owner: patte
--

INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('a3926669-d40e-4f20-a610-80722bf02724', 'bb88bb15-0471-4c43-b3c4-8d1ee4c8b615', '3837d7e2-8b8e-4e9a-8106-4de5aacedbcd', 1, 1, 1, 24000, true, 0, '2017-04-26 05:18:09.244+02', '2017-04-26 05:18:09.244+02');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('a3312329-ae52-44d6-8790-edec8e2f5a27', '81a32c97-d220-4289-80fa-a34d04495689', '3837d7e2-8b8e-4e9a-8106-4de5aacedbcd', 1, 100, 1, 24000, false, 0, '2017-04-26 05:18:09.256+02', '2017-04-26 05:18:09.256+02');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('2eb6c246-8106-491b-9e1a-11fe54157c6c', '81a32c97-d220-4289-80fa-a34d04495689', '43f69dbd-dca9-40a0-82d4-5ed431cb7278', 0, 100, 0, 2000, false, 0, '2017-04-26 05:18:09.26+02', '2017-04-26 05:18:09.26+02');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('e7dbe7e7-4a76-4dcb-b000-4dbdf1dece07', '15bc4bc9-dca5-4660-aea0-341afd55cd59', '5d4ab411-8a26-40dd-8a4f-f59cbfc9503f', 1, 1, 1, 100000, false, 0, '2017-04-26 05:18:09.27+02', '2017-04-26 05:18:09.27+02');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('91dac62c-80d3-40b9-8b3c-1cc675ed1573', '0fa44439-402c-42b6-815a-834c03285a39', NULL, 1, 1, 1, 0, true, 0, '2017-04-26 05:18:09.281+02', '2017-04-26 05:18:09.281+02');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('4ddd2c62-fcad-453d-819b-2efd4a4d66a8', '0a3c6c71-bc0a-436a-9b8c-1b04e8ebfd27', '3837d7e2-8b8e-4e9a-8106-4de5aacedbcd', 1, 1, 1, 24000, true, 0, '2017-07-24 11:16:57.721+02', '2017-07-24 11:16:57.721+02');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('02eb81c0-7285-4165-8110-5108b38e7746', '73dc795a-461d-47e7-a572-76c39cc4d367', '3837d7e2-8b8e-4e9a-8106-4de5aacedbcd', 1, 100, 1, 24000, false, 0, '2017-07-24 11:16:57.721+02', '2017-07-24 11:16:57.721+02');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('719c4140-ea17-49e3-a791-1905a3290f14', '44681937-2cfe-4caf-a766-e41a59948325', '5d4ab411-8a26-40dd-8a4f-f59cbfc9503f', 1, 1, 1, 100000, false, 0, '2017-07-24 11:16:57.721+02', '2017-07-24 11:16:57.721+02');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('07c46dc6-5da2-454d-b0aa-8253a02a0747', 'c2a226ad-7267-4144-8946-37d8076b5468', NULL, 1, 1, 1, 0, true, 0, '2017-07-24 11:16:57.721+02', '2017-07-24 11:16:57.721+02');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('e42859bf-1e18-4569-bb2c-426f9f5d4219', '73dc795a-461d-47e7-a572-76c39cc4d367', '43f69dbd-dca9-40a0-82d4-5ed431cb7278', 0, 100, 0, 2000, false, 0, '2017-11-21 23:26:21.680285+01', '2017-11-21 23:26:21.680285+01');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('4a145d01-9c17-4b25-bcea-e25ed4ba20d1', '73dc795a-461d-47e7-a572-76c39cc4d367', '00b84bff-9b49-4ca7-b6d7-760783b49bf3', 0, 100, 0, 2000, false, 0, '2017-11-21 23:26:21.680285+01', '2017-11-21 23:26:21.680285+01');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('606aea60-166f-4986-bbf2-1b3c7a469cbd', '2fe2650d-7bdf-41e1-adc3-e69288c5f7eb', '3837d7e2-8b8e-4e9a-8106-4de5aacedbcd', 1, 1, 1, 24000, true, 0, '2017-12-11 22:48:59.971+01', '2017-12-11 22:48:59.971+01');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('e3a6d4f5-31ff-405d-8e03-3b7c9419c781', '7884ba68-f495-4e9b-bd0c-c051317be138', '3837d7e2-8b8e-4e9a-8106-4de5aacedbcd', 1, 100, 1, 24000, false, 0, '2017-12-11 22:48:59.971+01', '2017-12-11 22:48:59.971+01');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('0110ef1c-cd90-46d9-b9cf-0679cfab1a82', '7884ba68-f495-4e9b-bd0c-c051317be138', '43f69dbd-dca9-40a0-82d4-5ed431cb7278', 0, 100, 0, 2000, false, 0, '2017-12-11 22:48:59.971+01', '2017-12-11 22:48:59.971+01');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('07685ac6-c9c8-4ef0-99ef-84713623d656', '7884ba68-f495-4e9b-bd0c-c051317be138', '00b84bff-9b49-4ca7-b6d7-760783b49bf3', 0, 100, 0, 2000, false, 0, '2017-12-11 22:48:59.971+01', '2017-12-11 22:48:59.971+01');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('1bf56b30-9521-4839-a358-27fe938e0c9d', '9334ee53-44fe-476f-b9f8-dc32d147bab6', '5d4ab411-8a26-40dd-8a4f-f59cbfc9503f', 1, 1, 1, 100000, false, 0, '2017-12-11 22:48:59.971+01', '2017-12-11 22:48:59.971+01');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('fd71bde2-ef13-4049-9639-bc2476fc70e7', '4d9e214c-9452-40c6-a38b-93be2e2c7c2a', NULL, 1, 1, 1, 0, true, 0, '2017-12-11 22:48:59.971+01', '2017-12-11 22:48:59.971+01');
INSERT INTO "packageOptions" (id, "packageId", "rewardId", "minAmount", "maxAmount", "defaultAmount", price, "userPrice", "minUserPrice", "createdAt", "updatedAt") VALUES ('97564753-a2aa-48fd-845f-260d18b40cbb', 'eab63f72-fa7d-4f69-b32c-a4157683cdc8', '003a5596-a797-4818-b0bc-a8347917561a', 1, 1, 1, 2000, false, 0, '2017-12-11 22:48:59.97106+01', '2017-12-11 22:48:59.97106+01');


--
-- PostgreSQL database dump complete
--

