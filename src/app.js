import express from "express";
import client, {collectDefaultMetrics} from "prom-client";
import {pool} from "workerpool";
import {letTheCpuBurn} from "./utils.js";

const app = express()
const port = process.env.PORT || 3000
const host = process.env.HOST || '127.0.0.1'

const taskPool = pool('./src/task.js', {maxWorkers: 4, workerType: 'thread'});

// Include default metrics
collectDefaultMetrics();

// Initialize counter
const receivedRequestsCounter = new client.Counter({
    name: 'count_of_requests',
    help: 'Counts all received requests',
});

// Initialize histogram
const processingTimeHistogram = new client.Histogram({
    name: 'processing_time',
    help: 'Measures processing time in seconds',
    labelNames: ['path'],
    buckets: client.exponentialBuckets(0.01, 2, 10),
});

app.get('/slow', (req, res) => {
    receivedRequestsCounter.inc(); // Counter: increment by 1
    const endTimer = processingTimeHistogram.startTimer({'path': req.path}); // Histogram: start timer

    taskPool.exec('letTheCpuBurn')
        .then(() => {
            res.send('It was slow...');
            endTimer(); // Finish timer, it will observe registered duration
            // above will call internally:
            // processingTimeHistogram.observe(seconds)
        })
        .catch(function (err) {
            res.sendStatus(500);
            console.error(err);
        })
})

app.get('/slow-blocking', (req, res) => {
    receivedRequestsCounter.inc();
    const endTimer = processingTimeHistogram.startTimer({'path': req.path});

    letTheCpuBurn();
    res.send('It was slow... and event loop was blocked.');
    endTimer(); // Finish timer, it will observe registered duration
})

app.get('/fast', async (req, res) => {
    receivedRequestsCounter.inc();
    const endTimer = processingTimeHistogram.startTimer({'path': req.path});

    res.send('Wow, it was fast!');

    endTimer();
})

app.get('/metrics', async (req, res) => {
    const register = client.register;
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});

app.listen(port, host, () => {
    console.log(`Prometheus metric demo app listening at http://${host}:${port}`)
})
