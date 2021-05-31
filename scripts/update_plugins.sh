#!/bin/bash

export PLUGIN_SERVER_IMAGE=$(/usr/local/bin/docker-compose ps -q plugin_server)

# echo "Removing existing plugin folder in Docker container.."
# docker-compose exec plugin_server rm -rf /app/plugins/
echo "Copying current plugin folder to Docker container.."
docker cp ../server/plugins/* "${PLUGIN_SERVER_IMAGE}":/app/plugins/
echo "Done."