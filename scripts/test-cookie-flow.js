const http = require('http');

function req(path, method = 'GET', body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {};
    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (cookie) headers['Cookie'] = cookie;
    const r = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method,
      headers
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: d }));
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

async function testAuth() {
  const loginRes = await req('/api/auth/login', 'POST', { email: 'admin@samora.pk', password: 'admin123' });
  const rawCookie = loginRes.headers['set-cookie'][0];
  const cookie = rawCookie.split(';')[0];
  console.log('Got cookie:', cookie);

  const ordersRes = await req('/api/admin/orders', 'GET', null, cookie);
  console.log('Orders status:', ordersRes.status, 'Orders count:', JSON.parse(ordersRes.body).length);

  const syncRes = await req('/api/admin/google-sync', 'GET', null, cookie);
  console.log('Sync status:', syncRes.status);

  const botRes = await req('/api/admin/whatsapp-bot', 'GET', null, cookie);
  console.log('Bot status:', botRes.status);
  const botJson = JSON.parse(botRes.body);
  console.log('Bot orders count:', (botJson.recentOrders || []).length);
  console.log('Bot greeting template:', JSON.stringify(botJson.settings?.whatsappTemplateQuizGreeting));
}

testAuth().catch(console.error);
