/** Quick smoke test for Phase 1e owner KYC routes */
async function post(path, body, token) {
  const res = await fetch(`http://localhost:3001/api${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} ${res.status}: ${data.error || res.statusText}`);
  return data;
}

async function get(path, token) {
  const res = await fetch(`http://localhost:3001/api${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} ${res.status}: ${data.error || res.statusText}`);
  return data;
}

async function main() {
  const player = await post('/auth/verify-otp', { phone: '9876543210', otp: '1234' });
  const apply = await post('/owners/apply', {
    businessName: 'Smoke Test Turf',
    ownerName: 'Smoke Owner',
    businessEmail: 'smoke@turfmate.in',
    pan: 'ABCDE1234F',
    bankAccount: '1234567890',
    ifsc: 'HDFC0001234',
    accountHolder: 'Smoke Owner',
    pinnedLocation: { address: 'Virar West', lat: 19.45, lng: 72.81 },
  }, player.token);
  console.log('apply:', apply.profile.approvalStatus, apply.turf?.id);

  const admin = await post('/auth/verify-otp', { phone: '9999999999', otp: '1234' });
  const pending = await get('/admin/kyc/pending', admin.token);
  console.log('pending:', pending.count);

  const uid = pending.owners.find((o) => o.businessName === 'Smoke Test Turf')?.id || pending.owners[0]?.id;
  if (!uid) throw new Error('No pending owner found');
  const approved = await post(`/admin/kyc/${uid}/approve`, {}, admin.token);
  console.log('approved:', approved.owner.approvalStatus);
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
