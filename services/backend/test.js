// Smoke test: confirms the server boots and /health responds.
// Does not require a live Redis connection (health returns 503 without it,
// which is still a valid HTTP response — the test just checks the server is up).
const http = require('http');
const { spawn } = require('child_process');

const server = spawn('node', ['index.js'], {
  env: { ...process.env, PORT: 5050, REDIS_HOST: 'localhost' }
});

setTimeout(() => {
  http.get('http://localhost:5050/health', (res) => {
    console.log('TEST PASSED: server responded with status', res.statusCode);
    server.kill();
    process.exit(0);
  }).on('error', (err) => {
    console.error('TEST FAILED:', err.message);
    server.kill();
    process.exit(1);
  });
}, 1500);
