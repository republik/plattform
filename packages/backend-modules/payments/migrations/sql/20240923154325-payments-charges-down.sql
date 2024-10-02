-- migrate down here: DROP TABLE...
--

DROP TABLE IF EXISTS payments."charges";

DROP TYPE payments.charge_status;
DROP TYPE payments.payment_method_type;
