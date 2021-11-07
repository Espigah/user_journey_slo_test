const amqp = require('amqplib/callback_api');
const { basketsHistogram, basketsHistogramAsync } = require('./prometheus.js');
const { v4: uuidv4 } = require('uuid');

let sendToQueue;

const registerBasketsHistogramAsync = (result, code = 200) => {
  try {
    const spentTime = Date.now() - result.startAt;
    const histogramPartial = basketsHistogramAsync.startTimer();
    setTimeout(() => {
      console.log(' [x] Completed %s', result);
      console.log('>>> spentTime', spentTime);
      histogramPartial({
        code,
      });
    }, spentTime);
  } catch (error) {
    console.log(error);
  }
};

const randomIntFromInterval = (min, max) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const connect = () => {
  const param = {
    hostname: process.env.RABBIT_HOST ?? 'rabbitmq',
    username: process.env.RABBIT_USERNAME ?? 'admin',
    password: process.env.RABBIT_PASSWORD ?? 'admin',
  };

  return new Promise((resolve, reject) => {
    const connect = () => {
      amqp.connect(param, function (error0, connection) {
        if (error0) {
          console.log(error0);
          console.log('retry');
          setTimeout(() => {
            connect();
          }, 1000);
          return;
        }
        console.log('connected');
        resolve(connection);
      });
    };
    connect();
  });
};

connect().then(async (conn) => {
  const channel = await conn.createChannel();

  sendToQueue = ({ id, startAt }) => {
    let queue = process.env.RABBIT_QUEUE_OUTPUT;
    channel.assertQueue(queue, {
      durable: false,
    });

    const payload = {
      id,
      message: process.env.MESSAGE,
      startAt,
    };

    console.log(' [ ] Preparing ', payload);

    const histogramPartial = basketsHistogram.startTimer();

    setTimeout(() => {
      try {
        // if (randomIntFromInterval(0, 1000) > 900) {
        //   throw new Error('Random exception');
        // }
        console.log(' [x] Sent ', payload);
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));

        histogramPartial({
          code: 200,
        });
      } catch (error) {
        console.log(error);
        registerBasketsHistogramAsync(payload, 500);
        histogramPartial({
          code: 500,
        });
      }
    }, randomIntFromInterval(0, 200));
  };

  let queue = process.env.RABBIT_QUEUE_INPUT;
  channel.assertQueue(queue, {
    durable: false,
  });

  channel.consume(
    process.env.RABBIT_QUEUE_INPUT,
    function (msg) {
      const result = JSON.parse(msg.content.toString('utf8'));
      console.log(' [x] Received %s', result);
      if (result.message === process.env.RABBIT_QUEUE_OUTPUT_IGNORE_MESSAGE) {
        registerBasketsHistogramAsync(result);

        console.log(' [x] SKP %s', result);
        return;
      }
      sendToQueue(result);
    },
    {
      noAck: true,
    }
  );
});

module.exports = {
  sendToQueue: () => {
    sendToQueue({ id: uuidv4(), startAt: Date.now() });
  },
};
