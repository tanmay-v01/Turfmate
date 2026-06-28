const request = require('supertest');
const express = require('express');
const authRouter = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

async function run() {
  console.log('--- TEST 1: Try to login with Phone (Should Fail) ---');
  let res = await request(app).post('/auth/send-otp').send({ phone: '9999999999' });
  console.log('Status:', res.status);
  console.log('Body:', res.body);

  console.log('\n--- TEST 2: Try to verify with Phone (Should Fail) ---');
  res = await request(app).post('/auth/verify-otp').send({ phone: '9999999999', otp: '1234' });
  console.log('Status:', res.status);
  console.log('Body:', res.body);
  
  console.log('\n--- TEST 3: Send OTP with Email (Should Succeed with fallback if DEMO_MODE=true) ---');
  res = await request(app).post('/auth/send-otp').send({ phone: 'test@turfmate.com' });
  console.log('Status:', res.status);
  console.log('Body:', res.body);
  const otp = res.body.devHint; // Captured because we will run this script with DEMO_MODE=true so it doesn't try to send a real email from local machine

  console.log('\n--- TEST 4: Verify with WRONG OTP (Should Fail) ---');
  res = await request(app).post('/auth/verify-otp').send({ phone: 'test@turfmate.com', otp: '1111' });
  console.log('Status:', res.status);
  console.log('Body:', res.body);

  console.log('\n--- TEST 5: Verify with CORRECT OTP (Should Succeed & Return JWT) ---');
  res = await request(app).post('/auth/verify-otp').send({ phone: 'test@turfmate.com', otp: otp });
  console.log('Status:', res.status);
  console.log('Body:', res.body.token ? 'JWT TOKEN RECEIVED' : res.body);
}

run();
