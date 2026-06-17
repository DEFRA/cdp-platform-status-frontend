#!/bin/bash
set -euo pipefail

ENDPOINT="${AWS_ENDPOINT_URL:-http://localhost:4566}"

# Platform status local AWS resources — matches backend .env.example
aws --endpoint-url="$ENDPOINT" s3 mb s3://platform-status 2>/dev/null || true
aws --endpoint-url="$ENDPOINT" sqs create-queue --queue-name platform_status 2>/dev/null || true
aws --endpoint-url="$ENDPOINT" sns create-topic --name platform_status 2>/dev/null || true
