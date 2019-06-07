## Usage

```bash
docker run --name=data-producer -d --restart=always \
        --network $2 \
        -e PERIOD_IN_MS=10000 \
        -e NUM_OF_USERS=3 \
        -e SESSION_PER_USER=5 \
        -e EVENTS_PER_SESSION=20 \
        -e TOPICS_USERS=users \
        -e TOPICS_EVENTS=events \
        -e CREATE_TOPICS="events:1:1,users:1:1" \
        -e RUN_MODE=default \
        -e EVENT_SCENARIO=random \        
        -e REDIS_HOST=redis \
        -e REDIS_PORT=6379 \
        -e BROKERS=broker1:9092,broker2:19092,broker3:29092 \
        -e VERBOSE="false" \
        -e APP_IDS="LovelyApp,LoveliestApp,HappyApp,HappiestApp" \
        -e NODE_ENV=production canelmas/data-producer:$1
```