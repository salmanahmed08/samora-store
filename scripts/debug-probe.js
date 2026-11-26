const http = require('http');

function post(path, data, cookie) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (cookie) headers['Cookie'] = cookie;
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, cookie) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (cookie) headers['Cookie'] = cookie;
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'GET',
      headers
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const loginRes = await post('/api/auth/login', { email: 'admin@samora.pk', password: 'admin12345' });
  console.log('Login status:', loginRes.status);
  console.log('Login set-cookie:', loginRes.headers['set-cookie']);

  const cookie = (loginRes.headers['set-cookie'] || [])[0];

  const ordersRes = await get('/api/admin/orders', cookie);
  console.log('Orders status:', ordersRes.status);
  console.log('Orders count:', JSON.parse(ordersRes.body).length);

  const botRes = await get('/api/admin/whatsapp-bot', cookie);
  console.log('Bot status:', botRes.status);
  const botJson = JSON.parse(botRes.body);
  console.log('Bot settings keys:', Object.keys(botJson.settings || {}));
  console.log('Bot recentOrders count:', (botJson.recentOrders || []).length);
  console.log('Bot sample greeting:', botJson.settings?.whatsappTemplateQuizGreeting);

  const syncRes = await get('/api/admin/google-sync', cookie);
  console.log('Sync status:', syncRes.status);
  const syncJson = JSON.parse(syncRes.body);
  console.log('Sync success:', syncJson.success);
}

run().catch(console.error);
