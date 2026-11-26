const http = require('http');
const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', d);
    console.log('COOKIES:', res.headers['set-cookie']);
  });
});
req.write(JSON.stringify({ email: 'admin@samora.pk', password: 'admin123' }));
req.end();
