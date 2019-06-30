## Usage

```bash
docker run --name=data-producer -d --restart=always \
        --network $2 \
        -e ENV=production \
        -e VERBOSE="true" \
        -e MODE=default \
        -e EVENT_SCENARIO=random \
        -e PERIOD_IN_MS=10000 \
        -e NUM_OF_USERS=3 \
        -e SESSION_PER_USER=5 \
        -e EVENTS_PER_SESSION=20 \
        -e ADD_USER_DEMOGRAPHICS="false" \
        -e REDIS_HOST=redis \
        -e REDIS_PORT=6379 \
        -e TOPIC_USERS=users \
        -e TOPIC_EVENTS=events \
        -e CREATE_TOPICS="events:1:1,users:1:1" \
        -e BROKERS=broker1:9092,broker2:19092,broker3:29092 \
        -e FORMAT=avro \
        -e SCHEMA_REGISTRY=http://schema-registry:8081 \
        -e WRITE_TO_MULTI_TOPICS="event:events-json:json,event:events-avro:avro:events-avro-value" \
        -e DATE_FORMAT="YYYY-MM-DDTHH:mm:ssZ" \        
        -e APP_IDS="LovelyApp,LoveliestApp,HappyApp,HappiestApp" \        
        canelmas/data-producer:$1
```
