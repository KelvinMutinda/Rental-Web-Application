const express = require('express');
const Payment = require('../models/payment');
const { requireAuth, requireApproved } = require('../middleware/auth');
const { normalizePhone, stkPush } = require('../utils/mpesa');

const router = express.Router();
router.use(requireAuth);

const pad = (n) => String(n).padStart(2, '0');
/* current rent month in Nairobi time, e.g. "2026-11" */
function currentMonth() {
  const d = new Date(Date.now() + 3 * 3600 * 1000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

async function rentSummary(user) {
  const month = currentMonth();
  const paidAgg = await Payment.aggregate([
    { $match: { tenant: user._id, month, status: 'confirmed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const paid = paidAgg[0]?.total || 0;
  const rent = user.rent || 0;
  return { month, rent, paid, balance: Math.max(0, rent - paid), dueDate: `${month}-${pad(user.dueDay || 5)}` };
}

/* GET /api/tenant/me – profile always; rental data ONLY when approved */
router.get('/me', async (req, res) => {
  try {
    const u = req.user;
    const profile = {
      id: u._id, firstName: u.firstName, lastName: u.lastName, email: u.email, phoneno: u.phoneno,
      regno: u.regno, course: u.course, roomType: u.roomType, role: u.role, status: u.status,
      rejectReason: u.status === 'rejected' ? u.rejectReason || null : undefined,
    };
    if (u.status !== 'approved') return res.json({ user: profile, rental: null });

    const summary = await rentSummary(u);
    const history = await Payment.find({ tenant: u._id }).sort({ createdAt: -1 }).limit(20);
    res.json({
      user: profile,
      rental: {
        roomNumber: u.roomNumber,
        roomType: u.roomType,
        ...summary,
        payments: history.map((p) => ({
          id: p._id, date: p.paidAt || p.createdAt, reference: p.mpesaReceipt || null,
          amount: p.amount, status: p.status, month: p.month,
        })),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* POST /api/tenant/pay  { amount, phone? } – starts an M-Pesa STK push */
router.post('/pay', requireApproved, async (req, res) => {
  try {
    const u = req.user;
    const { rent, paid, balance, month } = await rentSummary(u);
    if (!rent) return res.status(400).json({ message: 'Your rent has not been set yet. Contact the admin.' });
    if (balance <= 0) return res.status(400).json({ message: 'Your rent for this month is already cleared.' });

    const amount = Math.round(Number(req.body.amount));
    if (!Number.isFinite(amount) || amount < 1) return res.status(400).json({ message: 'Enter a valid amount' });
    if (amount > balance) return res.status(400).json({ message: `Amount cannot be more than your balance (KES ${balance.toLocaleString()})` });

    const phone = normalizePhone(req.body.phone || u.phoneno);
    if (!phone) return res.status(400).json({ message: 'Enter a valid Safaricom number, e.g. 0712345678' });

    // stop double taps: one prompt at a time
    const recent = await Payment.findOne({ tenant: u._id, status: 'pending', createdAt: { $gt: new Date(Date.now() - 90 * 1000) } });
    if (recent) return res.status(429).json({ message: 'A payment prompt was just sent. Check your phone or wait a minute.' });

    let result;
    try {
      result = await stkPush({ phone, amount, accountRef: u.roomNumber || u.regno, description: 'Rent' });
    } catch (err) {
      console.error('STK push failed:', err.message);
      return res.status(502).json({ message: 'Could not start the M-Pesa payment. Please try again.' });
    }

    const payment = await Payment.create({
      tenant: u._id, month, amount, phone,
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID,
    });

    res.status(202).json({ paymentId: payment._id, message: 'Check your phone and enter your M-Pesa PIN.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* GET /api/tenant/payments/:id – the page polls this after sending the prompt */
router.get('/payments/:id', async (req, res) => {
  try {
    const p = await Payment.findOne({ _id: req.params.id, tenant: req.user._id });
    if (!p) return res.status(404).json({ message: 'Payment not found' });
    res.json({ status: p.status, receipt: p.mpesaReceipt || null, message: p.status === 'failed' ? p.resultDesc : null });
  } catch {
    res.status(404).json({ message: 'Payment not found' });
  }
});

module.exports = router;
