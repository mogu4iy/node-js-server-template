#!/bin/sh
set -e
healthcheck -e .env.healthcheck -c healthcheck.json check
exec "$@"