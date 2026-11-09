

const BASE = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';


function normalizePhone(input) {
  let s = String(input || '').replace(/[\s+\-()]/g, '');
  if (/^0[17]\d{8}$/.test(s)) s = '254' + s.slice(1);
  else if (/^[17]\d{8}$/.test(s)) s = '254' + s;
  return /^254[17]\d{8}$/.test(s) ? s : null;
}


function timestamp() {
  const d = new Date(Date.now() + 3 * 3600 * 1000);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
}

let cached = { token: null, exp: 0 };
async function getToken() {
  if (cached.token && Date.now() < cached.exp) return cached.token;
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const res = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) throw new Error(`Daraja auth failed (${res.status})`);
  const data = await res.json();
  cached = { token: data.access_token, exp: Date.now() + (Number(data.expires_in) - 60) * 1000 };
  return cached.token;
}

async function stkPush({ phone, amount, accountRef, description }) {
  const shortcode = process.env.MPESA_SHORTCODE;
  const ts = timestamp();
  const password = Buffer.from(`${shortcode}${process.env.MPESA_PASSKEY}${ts}`).toString('base64');

  const body = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: ts,
    TransactionType: process.env.MPESA_TXN_TYPE || 'CustomerPayBillOnline', 
    Amount: Math.round(amount),
    PartyA: phone,
    PartyB: process.env.MPESA_PARTYB || shortcode,
    PhoneNumber: phone,
    CallBackURL: `${process.env.MPESA_CALLBACK_URL}/api/mpesa/callback/${process.env.MPESA_CALLBACK_SECRET}`,
    AccountReference: String(accountRef).slice(0, 12),
    TransactionDesc: String(description).slice(0, 13),
  };

  const res = await fetch(`${BASE}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await getToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ResponseCode !== '0') {
    throw new Error(data.errorMessage || data.ResponseDescription || `STK push failed (${res.status})`);
  }
  return data;
}

module.exports = { normalizePhone, timestamp, stkPush };
