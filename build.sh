#!/bin/bash

build_and_push() {
    npm run build

    docker build -t canelmas/data-producer:$1 .
    docker push canelmas/data-producer:$1
}

if [ $# -lt 1 ]; then
    echo "Usage: build <version>"
    exit 1
else
    build_and_push $1
fi
