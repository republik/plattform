#!/bin/bash
node script/launch/copy_CF_DB.js $1 &&
  psql postgres://$1@localhost:5432/republik -c "ALTER TYPE \"paymentType\" ADD VALUE IF NOT EXISTS 'MEMBERSHIP_PERIOD' AFTER 'PLEDGE'" &&
  yarn run launch
