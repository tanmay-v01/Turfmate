const express = require('express');
const { authRequired, loadUser } = require('../middleware/auth');
const paymentsRepo = require('../repositories/payments');

const router = express.Router();

router.post('/orders', authRequired, loadUser, async (req, res) => {
  try {
    const body = req.body || {};
    const { purpose, amountPaise, amount, ...payload } = body;
    if (!purpose || (amountPaise == null && amount == null)) {
      return res.status(400).json({ error: 'purpose and amount are required' });
    }
    const paise = amountPaise != null ? Number(amountPaise) : Math.round(Number(amount) * 100);
    if (!Number.isFinite(paise) || paise < 100) {
      return res.status(400).json({ error: 'amount must be at least ₹1' });
    }
    if (amount != null && payload.amount == null) {
      payload.amount = Number(amount);
    }

    const order = await paymentsRepo.createOrder({
      userId: req.user.id,
      purpose,
      amountPaise: paise,
      payload,
    });
    res.json(order);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/verify', authRequired, loadUser, async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.orderId) return res.status(400).json({ error: 'orderId is required' });

    const result = await paymentsRepo.verifyAndFulfill({
      orderId: body.orderId,
      userId: req.user.id,
      razorpayOrderId: body.razorpayOrderId || body.razorpay_order_id,
      razorpayPaymentId: body.razorpayPaymentId || body.razorpay_payment_id,
      razorpaySignature: body.razorpaySignature || body.razorpay_signature,
      demo: Boolean(body.demo),
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
