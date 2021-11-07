const express = require('express');
const amqp = require('./amqp.js');
const { histogram, client } = require('./prometheus.js');

const app = express();
const port = 3000;

// const promMid = require('express-prometheus-middleware');
// app.use(
//   promMid({
//     metricsPath: '/metrics',
//     collectDefaultMetrics: true,
//     requestDurationBuckets: [0.1, 0.5, 1, 1.5],
//     requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
//     responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
//     prefix: process.env.APP_NAME + '_',
//   })
// );

// expose our metrics at the default URL for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/test/1', (req, res) => {
  const end = histogram.startTimer();

  try {
    amqp.sendToQueue();
    res.send('Hello World!');
  } catch (err) {
    res.status(500).send({ error: err.toString() });
  }

  res.on('finish', () =>
    end({
      method: req.method,
      handler: new URL(req.url, `http://${req.hostname}`).pathname,
      code: res.statusCode,
    })
  );
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
