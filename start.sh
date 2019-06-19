#!/bin/bash

stop() {
    docker stop data-producer && docker rm -f data-producer
}

start() {
    docker run --name=data-producer -d --restart=always \
        --network $2 \
        -e PERIOD_IN_MS=3000 \
        -e NUM_OF_USERS=5 \
        -e SESSION_PER_USER=2 \
        -e EVENTS_PER_SESSION=20 \
        -e TOPIC_USERS=users \
        -e TOPIC_EVENTS=events \
        -e CREATE_TOPICS="events:1:1,users:1:1" \
        -e MODE=default \
        -e EVENT_SCENARIO=apm \
        -e NODE_OPTIONS=--max_old_space_size=4096 \
        -e REDIS_HOST=redis \
        -e REDIS_PORT=6379 \
        -e BROKERS=broker:19092 \
        -e VERBOSE="true" \
        -e DATE_FORMAT="YYYY-MM-DDTHH:mm:ssZ" \
        -e APP_IDS="LovelyApp,LoveliestApp,HappyApp,HappiestApp" \
        -e ENV=production \
        -e FORMAT=avro \        
        -e SCHEMA_REGISTRY=http://schema-registry:8081 \
        -e WRITE_TO_MULTI_TOPICS="event:events-json:json,event:events-avro-default:avro:events-avro-default-value,event:events-avro-map:avro:events-avro-map-value" \
        -e USER_DEMOGRAHPHICS="false"
    canelmas/data-producer:$1
}

if [ $# -lt 2 ]; then
    echo "Usage: start <version:required> <network:required>"
    exit 1
else
    stop
    start $1 $2
fi
