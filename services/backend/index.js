const express = require('express');
const redis = require('redis');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 5000;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient({
  socket: { host: REDIS_HOST, port: REDIS_PORT }
});
client.on('error', (err) => console.error('Redis error:', err));

let redisReady = false;
(async () => {
  await client.connect();
  redisReady = true;
  console.log(`Connected to Redis at ${REDIS_HOST}:${REDIS_PORT}`);
})();

app.get('/api/visits', async (req, res) => {
  try {
    const count = await client.incr('visit_count');
    res.json({
      visits: count,
      servedBy: os.hostname(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not reach Redis' });
  }
});

app.get('/health', (req, res) => {
  res.status(redisReady ? 200 : 503).json({ status: redisReady ? 'UP' : 'DEGRADED' });
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
