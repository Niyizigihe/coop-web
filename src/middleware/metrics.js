import client from 'prom-client';

// Default metrics
client.collectDefaultMetrics({ prefix: 'coop_web_' });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5]
});

const activeConnections = new client.Gauge({
  name: 'active_db_connections',
  help: 'Number of active database connections'
});

// Middleware to track HTTP metrics
export function metricsMiddleware(req, res, next) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const route = req.route?.path || req.path || 'unknown';
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
}

// Function to track database query metrics
export function trackDbQuery(queryType, duration, status = 'success') {
  dbQueryDuration
    .labels(queryType, status)
    .observe(duration / 1000);
}

export function updateActiveConnections(count) {
  activeConnections.set(count);
}

// Export metrics endpoint
export function metricsEndpoint(req, res) {
  res.set('Content-Type', client.register.contentType);
  res.end(client.register.metrics());
}
