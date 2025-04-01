const express = require('express');
const promBundle = require('express-prom-bundle');
const client = require('prom-client');
const winston = require('winston');
const LokiTransport = require('winston-loki');

// Loki Logger Setup
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new LokiTransport({
      host: 'http://loki:3100',
      labels: { 
        job: 'observability-demo',
        service: 'api-service'
      },
      json: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      onConnectionError: (err) => 
        console.error('Loki connection error:', err)
    })
  ]
});


// Metrics Setup 
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  customLabels: { project: 'observability-demo' },
  promClient: { collectDefaultMetrics: {} }
});

const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'success']
});

const errorCounter = new client.Counter({
  name: 'api_errors_total',
  help: 'Total number of API errors',
  labelNames: ['endpoint', 'status_code']
});

// Express Setup
const app = express();
app.use(metricsMiddleware);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  logger.info({
    message: 'Request started',
    method: req.method,
    path: req.path,
    ip: req.ip
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      message: 'Request completed',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
});

// API Endpoint (With Logging)
app.get('/api/data', async (req, res) => {
  const start = Date.now();
  
  try {
    // Simulate DB call with logging
    const delay = await fakeDatabaseQuery();
    logger.debug(`Database query completed in ${delay}ms`);

    if (Math.random() < 0.2) {
      logger.warn('Simulating API error');
      throw new Error('Simulated error');
    }
    
    res.json({ success: true });
  } catch (err) {
    logger.error({
      message: 'API error occurred',
      error: err.message,
      stack: err.stack
    });
    
    errorCounter.inc({ endpoint: '/api/data', status_code: 500 });
    res.status(500).json({ error: err.message });
  } finally {
    const duration = (Date.now() - start) / 1000;
    dbQueryDuration.observe({ operation: 'get_data' }, duration);
  }
});

// Database Simulation (With Logging)
async function fakeDatabaseQuery() {
  return new Promise((resolve) => {
    const delay = Math.random() < 0.5 ? 100 : 3000;
    
    if (delay > 1000) {
      logger.warn(`Slow query detected: ${delay}ms delay`);
    }
    
    setTimeout(() => resolve(delay), delay);
  });
}


// Existing Metrics Endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(3000, () => {
  logger.info('Server started on port 3000');
});