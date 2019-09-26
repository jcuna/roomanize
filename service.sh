#!/usr/bin/env bash

if [[ "$1" != "" && "$1" != "stop" && "$1" != "ssh" && "$1" != "build" && "$1" != "test" ]]; then

    printf "Bad argument ${1}.\n"
    printf "Options:\n"
    printf "\t<no args>          -- Starts or restarts service\n"
    printf "\t<stop>             -- Stops serice\n"
    printf "\t<ssh>              -- Logs into containers bash console\n"
    printf "\t<build>            -- Builds a prod ready docker image\n"
    printf "\t<test>             -- Runs pytest on the api\n"
    exit 1;
fi

LATEST_API=1.0
API_IMG_NAME="roomanize-api"

get_container_id() {

    CONTAINER_SSH=$1
    IMAGE_NAME=$(docker ps --format '{{.Names}} {{.Image}}' | grep $CONTAINER_SSH | grep -oE "^[1-9_a-zA-Z]+")
    echo $(docker ps -a -q --filter name="$IMAGE_NAME" --format="{{.ID}}")
}

if [[ "$1" = "test" ]]; then
    CONTAINER_ID=$(get_container_id ${API_IMG_NAME})
    docker exec -ti ${CONTAINER_ID} bash -c \
        "PYTHONDONTWRITEBYTECODE=1 APP_SETTINGS_PATH='/tmp/settings.py' pytest -ra $2 $3"
    exit $?
fi


if [[ "$1" = "ssh" ]]; then
    if [[ "$2" = "" ]]; then
        CONTAINER_SSH=$API_IMG_NAME
    else
        CONTAINER_SSH="$2"
    fi

    CONTAINER_ID=$(get_container_id ${CONTAINER_SSH})

    if [[ ! -z "$CONTAINER_ID" ]]; then
        docker exec -ti "$CONTAINER_ID" /bin/bash
    else
        printf "Could not find container, is it even running?\n"
        exit 1
    fi
    exit
fi

if [[ "$1" = "build" ]]; then
  if [[ ! -f ./settings.prod.py ]]; then
    printf "No prod settings.prod.py file to build with config\n"
    exit 1
  fi

  docker rmi $(docker images | grep $API_IMG_NAME | grep -oE [0123456789abcdef]{12}) 2> /dev/null
  docker build -t "$API_IMG_NAME:$LATEST_API" -f ./docker/prod.Dockerfile .
  [[ $? -eq 0 ]] && docker images "$API_IMG_NAME:$LATEST_API" && exit 0 || exit 1

fi

if [[ ! -f "./docker/docker-compose.yml" ]]; then
    printf "Call me from isc-api's root directory.\n"
    exit 1
fi

if [[ "$1" = "stop" ]]; then
    API_IMG=${API_IMG_NAME}:${LATEST_API} docker-compose -f docker/docker-compose.yml down
    exit;
fi

if [[ "$1" = "" ]]; then
    API_IMG=${API_IMG_NAME}:${LATEST_API} docker-compose -f docker/docker-compose.yml down > /dev/null 2>&1

    if [[ "$(docker images -q "$API_IMG_NAME:$LATEST_API" 2> /dev/null)" = "" ]]; then
        printf "New image version found! need to rebuild\n"
        docker rmi $(docker images | grep $API_IMG_NAME | grep -oE [0123456789abcdef]{12}) 2> /dev/null
        docker build -t "$API_IMG_NAME:$LATEST_API" -f ./docker/Dockerfile ./api
    fi
    FILES="-f docker/docker-compose.yml"
    if [[ -f "docker/docker-compose-override.yml" ]]; then
        FILES="$FILES -f docker/docker-compose-override.yml"
    fi
   API_IMG=${API_IMG_NAME}:${LATEST_API} docker-compose $(echo "$FILES up -d");
fi;


printf "\nhttp://roomanize.localhost/\n"
printf "http://portainer.localhost/\n"
printf "http://mailhog.localhost/\n"
printf "http://supervisor.localhost/\n"
printf "http://localhost:8080/\n"

exit 0
