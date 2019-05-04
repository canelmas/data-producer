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
        -e RUN_MODE=0 \
        -e EVENT_SCENARIO=random \
        -e NODE_OPTIONS=--max_old_space_size=4096 \
        -e REDIS_HOST=redis \
        -e REDIS_PORT=6379 \
        -e BROKER=broker:9092 \
        -e VERBOSE="false" \
        -e APP_IDS="LovelyApp,LoveliestApp,HappyApp,HappiestApp" \
        -e NODE_ENV=production canelmas/data-producer:$1
```