const jwt = require('jsonwebtoken');

// Replace these with your actual keys from .env.local
const API_KEY = '61a6e5af-c0ce-4ca5-a017-bfc7b45d7ad7';
const SECRET_KEY = 'd3b3f5dc1aeece178286b861caf143dd389d2608f3cb1c7a572b565ba115c41d';

const payload = {
  apikey: API_KEY,
  permissions: ['allow_join', 'allow_mod'],
  version: 2
};

const token = jwt.sign(payload, SECRET_KEY, {
  algorithm: 'HS256',
  expiresIn: '12h'
});

console.log(token);
