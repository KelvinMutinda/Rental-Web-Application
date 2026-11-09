const express = require('express');
const Payment = require('../models/payment');

const router = express.Router();

/* Safaricom POSTs the result here. The secret in the URL stops random people from
   faking a "payment confirmed" call. Always answer 200, or Safaricom keeps retrying. */
router.post('/callback/:secret', async (req, res) => {
  const ack = () => res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

  if (!process.env.MPESA_CALLBACK_SECRET || req.params.secret !== process.env.MPESA_CALLBACK_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const cb = req.body?.Body?.stkCallback;
    if (!cb || !cb.CheckoutRequestID) return ack();

    if (cb.ResultCode === 0) {
      const items = cb.CallbackMetadata?.Item || [];
      const get = (name) => items.find((i) => i.Name === name)?.Value;
      const paidAmount = Number(get('Amount'));

      const payment = await Payment.findOne({ checkoutRequestId: cb.CheckoutRequestID });
      // only confirm if the amount matches what we asked for
      const status = payment && paidAmount === payment.amount ? 'confirmed' : 'failed';

      await Payment.findOneAndUpdate(
        { checkoutRequestId: cb.CheckoutRequestID, status: 'pending' },   // pending-only = safe if Safaricom retries
        {
          status,
          mpesaReceipt: get('MpesaReceiptNumber'),
          resultDesc: status === 'failed' ? 'Amount mismatch – contact the admin' : cb.ResultDesc,
          paidAt: new Date(),
        }
      );
    } else {
      await Payment.findOneAndUpdate(
        { checkoutRequestId: cb.CheckoutRequestID, status: 'pending' },
        { status: 'failed', resultDesc: cb.ResultDesc }   // cancelled, wrong PIN, insufficient funds…
      );
    }
  } catch (err) {
    console.error('M-Pesa callback error:', err);
  }
  ack();
});

module.exports = router;
