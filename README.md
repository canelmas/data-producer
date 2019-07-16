## Usage

```bash
docker run --name=data-producer -d --restart=always \
        -e ENV=production \
        -e VERBOSE="true" \
        -e MODE=default \
        -e EVENT_SCENARIO=random \
        -e PERIOD_IN_MS=10000 \
        -e NUM_OF_USERS=3 \
        -e SESSION_PER_USER=5 \
        -e EVENTS_PER_SESSION=20 \
        -e APP_IDS="LovelyApp,LoveliestApp,HappyApp,HappiestApp" \
        -e ADD_USER_DEMOGRAPHICS="false" \
        -e DATE_FORMAT="YYYY-MM-DDTHH:mm:ssZ" \
        -e REDIS_HOST=redis \
        -e REDIS_PORT=6379 \
        -e BROKERS=broker1:9092,broker2:19092,broker3:29092 \
        -e CREATE_TOPICS="events:1:1,users:1:1" \
        -e TOPIC_USERS=users \
        -e TOPIC_EVENTS=events \
        -e FORMAT=avro \
        -e WRITE_TO_MULTI_TOPICS="event:events-json:json,event:events-avro:avro:events-avro-value" \
        -e SCHEMA_REGISTRY=http://schema-registry:8081 \
        canelmas/data-producer:4.1.0
```
Images are available on [DockerHub](https://hub.docker.com/r/canelmas/data-producer).

## Env Variables

### `ENV`

- __`production`__ : Messages are written to Kafka.
- __`development`__ : Messages are written to console.

Default is __development__.

### `VERBOSE`

- __`"true"`__ : Kafka Record metadata is written to console for each message.
- __`"false"`__ : Kafka Record metadata is not written to console for each message.

This option makes only sense when `ENV=production`.

Default is __false__.

### `MODE`

- __`default`__ : Events and users are generated and written to Kafka.
- __`create-users`__ : Generate users and writes them to Redis, without writing any record to Kafka.
- __`use-redis`__ : Generate events by using random users in Redis. Events are written to Kafka; users are not.
- __`send-users`__ : Write users in Redis to Kafka.

`create-users`, `use-redis` and `send-users` modes require you to set `REDIS_HOST` and `REDIS_PORT`.

Default is __`default`__.

### `EVENT_SCENARIO`

- __`random`__ : Choose among `view`, `commerce`, `custom` and `apm` types each time an event is generated.
- __`view`__ : Only _`viewStart`_ and _`viewStop`_ events are generated randomly.
- __`commerce`__ : Only _`purchase`, `purchaseError`, `viewProduct`, `viewCategory`, `search`, `clearCart`, `addToWishList`, `removeFromWishList`, `startCheckout`, `addToCart`_ and _`removeFromCart`_ events are generated randomly.
- __`apm`__ : Only _`httpCall`_ and _`networkError`_ events are generated randomly.
- __`custom`__ : Check [here](https://github.com/canelmas/data-producer/blob/8bb80243ae6d996fcebee69f596438c093fd1988/generators/custom_events.js#L258) to see list of custom events.

Default is __`random`__.

### `PERIOD_IN_MS`

Period in milliseconds to generate and send events/users. 

Default is __5000__.

### `NUM_OF_USERS`

Number of users to generate and send for each period.

Default is __1__.

### `SESSION_PER_USER`

Number of sessions to generate for each user within each period.

Default is __1__.

### `EVENTS_PER_SESSION`

Number of events to generate for each user session.

Default is __5__.

### `DEVICE_ID`

Device id to be used for each event.

Once this option is set, only one user is generated and used throughout the event generation.

Default is __undefined__.

### `APP_IDS`

Comma separated app names to use randomly as `appId` for each event. (e.g. `APP_IDS=DemoApp,FooApp,BarApp,ZooWebApp`)

Default is __DemoApp__.

### `ADD_USER_DEMOGRAPHICS`

Whether bunch of demographics information should be generated and set for each user.

Check [here](https://github.com/canelmas/data-producer/blob/8bb80243ae6d996fcebee69f596438c093fd1988/generators/user_generator.js#L42) to see list of demographics information generated.

Default is __false__.

### `DATE_FORMAT`

Date format to be used in event and user data generated.

Check [moment.js](https://momentjs.com/) or this [cheatsheet](https://devhints.io/moment) for format options.

Default is __YYYY-MM-DDTHH:mm:ssZ__.

### `REDIS_HOST`

Redis host.

This option is required only if you're running one of the following modes : `create-users`, `use-redis`, `send-users`.

Default is __undefined__.

### `REDIS_PORT`

Redis port.

This option is required only if you're running one of the following modes : `create-users`, `use-redis`, `send-users`.

Default is __undefined__.

### `BROKERS`

Comma separated Kafka brokers. (e.g. `BROKERS=kafka1:19092,kafka2:29092,kafka3:39092`)

Default is __localhost:19092__.

### `CREATE_TOPICS`

If set, create Kafka topics. 

This configuration expects comma separated list of entries with the following format : `topic name(required):number of partitions(required):replications factor(required)`

For example, `CREATE_TOPICS=A:3:1,B:1:1` configuration will create two topics named A and B. Topic A will have 2 as the partition number and 1 as the replication factor whereas topic B will have its partition number and replication factor set to 1.

Default is __undefined__.

By default event and user data are written respectively to `events` and `users` topics. So you better make sure that these topics are present or create these topics by setting this parameter. 

Only exception to this, is `WRITE_TO_MULTI_TOPICS` case. When this parameter is set, event and user data are not written to default topics (`events` and `users`), but the topics specified with `WRITE_TO_MULTI_TOPICS` parameter.

### `TOPIC_USERS`

Name of the topic for Kafka producer to send user data.

Default is __users__.

This parameter is ignored if `WRITE_TO_MULTI_TOPICS` is used.

### `TOPIC_EVENTS`

Name of the topics for Kafka producer to send event data.

Default is __events__.

This parameter is ignored if `WRITE_TO_MULTI_TOPICS` is used.

### `FORMAT`

Serialization format of Kafka records. Only `json` and `avro` are supported.

Default is __json__.

### `SCHEMA_REGISTRY`

Required schema registry url if `avro` format is used.

Default is __undefined__.

### `WRITE_TO_MULTI_TOPICS`

Convenient when the same record must be written to multiple topics.

This configuration expects comma separated list of entries with the following format : 
`entity type(required):topic name(required):serialization format(required):subject name if avro is used(optional)`

Supported entity types are `user` for user data and `event` for event data.

For example, in order to write event messages to two different topics, first in json and the second in avro, following configuration may be used:

`WRITE_TO_MULTI_TOPICS=event:events-json:json,event:events-avro:avro:events-avro-value`

We're basically saying producer to write `event` entity (generated event data) to both 

- `events-json` topic in `json format` and
- `events-avro` topic with subject name `events-avro-value` in `avro` format.

If `avro` is used, make sure before to set `SCHEMA_REGISTRY` and to register the schema under the subject name `events-avro-value`.

Default is __undefined__.

### `WEBHOOK`

Convenient when you need to post events to a webhook in addition to kafka.

Only events are posted to specified webhook; users are omitted.

Default is __undefined__.

### `WEBHOOK_HEADERS`

Comma separated headers to pass while using `WEBHOOK` (e.g. `x-api-key:ABCD-XYZ,lovely-header:lovely-header-value`)

Default is __undefined__.