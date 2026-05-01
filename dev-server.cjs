const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const preferredPort = Number(process.env.PORT || 3000);
const backendHost = process.env.BACKEND_HOST || 'localhost';
const backendPort = Number(process.env.BACKEND_PORT || 2026);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

if (process.argv.includes('--check')) {
  for (const file of ['index.html', 'src/browser-app.js', 'src/index.css']) {
    if (!fs.existsSync(path.join(root, file))) {
      console.error(`Missing ${file}`);
      process.exit(1);
    }
  }
  new Function(fs.readFileSync(path.join(root, 'src/browser-app.js'), 'utf8'));
  console.log('Frontend files OK');
  process.exit(0);
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    proxyToBackend(req, res);
    return;
  }

  const cleanUrl = decodeURIComponent(req.url.split('?')[0]);
  const relative = cleanUrl === '/' ? 'index.html' : cleanUrl.slice(1);
  const filePath = path.normalize(path.join(root, relative));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(root, 'index.html'), (fallbackError, fallbackData) => {
        if (fallbackError) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': types['.html'] });
        res.end(fallbackData);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
});

listen(preferredPort);

function listen(port) {
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && !process.env.PORT) {
      console.log(`Port ${port} is busy. Trying ${port + 1}...`);
      listen(port + 1);
      return;
    }
    throw error;
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`Nspire frontend running at http://127.0.0.1:${port}`);
    console.log(`API proxy forwarding /api to http://${backendHost}:${backendPort}`);
  });
}

function proxyToBackend(clientReq, clientRes) {
  const headers = { ...clientReq.headers, host: `${backendHost}:${backendPort}` };
  const proxyReq = http.request(
    {
      hostname: backendHost,
      port: backendPort,
      path: clientReq.url,
      method: clientReq.method,
      headers,
    },
    (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(clientRes);
    }
  );

  proxyReq.on('error', () => {
    clientRes.writeHead(502, { 'Content-Type': 'application/json' });
    clientRes.end(JSON.stringify({ message: 'Backend is not running on http://localhost:2026' }));
  });

  clientReq.pipe(proxyReq);
}
