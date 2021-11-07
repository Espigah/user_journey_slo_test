const client = require('prom-client');

// enable prom-client to expose default application metrics
const collectDefaultMetrics = client.collectDefaultMetrics;

// define a custom prefix string for application metrics
collectDefaultMetrics({ prefix: process.env.APP_NAME + '_' });

const histogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds histogram',
  labelNames: ['method', 'handler', 'code'],
  buckets: [0.1, 0.2, 0.3, 0.5, 1, 2], //seconds
});

const basketsHistogram = new client.Histogram({
  name: 'buy_baskets',
  help: 'Duration of HTTP requests in seconds histogram',
  labelNames: ['code'],
  buckets: [0.1, 0.2, 0.3, 0.5, 1, 2], //seconds
});

const basketsHistogramAsync = new client.Histogram({
  name: 'buy_baskets_async',
  help: 'Duration of HTTP requests in seconds histogram',
  labelNames: ['code'],
  buckets: [0.1, 0.2, 0.3, 0.5, 1, 2], //seconds
});

module.exports = {
  basketsHistogram,
  basketsHistogramAsync,
  histogram,
  client,
};
