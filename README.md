# Monitoring with Prometheus

## Starting the demo

```shell
docker-compose up -d
```

## Generating test load

```shell
docker run --rm -it --network=prometheus-demo nakabonne/ali ali -d 0 -r 50 http://demo-app:3000/slow
```

where `-d` is duration and `-r` rate (number of requests)

## Sample Prometheus queries

[App metrics](http://localhost:9090/graph?g0.expr=histogram_quantile(0.9%2C%20(rate(processing_time_bucket%5B1m%5D)))&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=5m&g1.expr=count_of_requests&g1.tab=0&g1.stacked=0&g1.show_exemplars=0&g1.range_input=1m&g2.expr=rate(count_of_requests%5B30s%5D)&g2.tab=0&g2.stacked=0&g2.show_exemplars=0&g2.range_input=1m)

[Observing Node.js event loop lag](http://localhost:9090/graph?g0.expr=nodejs_eventloop_lag_p90_seconds&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=15m)

## Demo scenarios

### Example 1

Run simultaneously:

```shell
docker run --rm -it --network=prometheus-demo nakabonne/ali ali -d 0 -r 150 http://demo-app:3000/fast
docker run --rm -it --network=prometheus-demo nakabonne/ali ali -d 0 -r 150 http://demo-app:3000/slow
```

Observe:

- App metrics (rate and response time for two endpoints)

### Example 2

Test a slow endpoint

```shell
docker run --rm -it --network=prometheus-demo nakabonne/ali ali -d 0 -r 250 http://demo-app:3000/slow
``` 

Test a slow endpoint that performs CPU intensive task on main thread

```shell
docker run --rm -it --network=prometheus-demo nakabonne/ali ali -d 0 -r 250 http://demo-app:3000/slow-blocking
``` 

Observe and compare:

- App metrics (rate and response time for two endpoints)
- Event loop lag
- Possibly missing metrics (due to non-responsive `/metrics` endpoint)
