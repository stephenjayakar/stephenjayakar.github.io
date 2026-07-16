#!/bin/bash

set -e

SITE_URL="https://stephenjayakar.com"
SITE_HOST="stephenjayakar.com"
INDEXNOW_KEY="80cf4a55e0f2eaefb6664a33617ff6a8"
INDEXNOW_ENDPOINT="https://api.indexnow.org/indexnow"

if [ "$#" -eq 0 ]; then
  echo "Usage: $0 <site-url> [site-url ...]" >&2
  exit 1
fi

if [ "$#" -gt 10000 ]; then
  echo "IndexNow accepts at most 10,000 URLs per request." >&2
  exit 1
fi

for url in "$@"; do
  case "$url" in
    "$SITE_URL"|"$SITE_URL"/*) ;;
    *)
      echo "Refusing to submit a URL outside $SITE_URL: $url" >&2
      exit 1
      ;;
  esac
done

PAYLOAD_FILE=$(mktemp)
RESPONSE_FILE=$(mktemp)
trap 'rm -f "$PAYLOAD_FILE" "$RESPONSE_FILE"' EXIT

{
  printf '{"host":"%s","key":"%s","keyLocation":"%s/%s.txt","urlList":[' \
    "$SITE_HOST" "$INDEXNOW_KEY" "$SITE_URL" "$INDEXNOW_KEY"

  separator=""
  for url in "$@"; do
    escaped_url=$(printf '%s' "$url" | sed 's/\\/\\\\/g; s/"/\\"/g')
    printf '%s"%s"' "$separator" "$escaped_url"
    separator=","
  done

  printf ']}'
} > "$PAYLOAD_FILE"

HTTP_STATUS=$(curl \
  --silent \
  --show-error \
  --output "$RESPONSE_FILE" \
  --write-out '%{http_code}' \
  --header 'Content-Type: application/json; charset=utf-8' \
  --data-binary "@$PAYLOAD_FILE" \
  "$INDEXNOW_ENDPOINT")

case "$HTTP_STATUS" in
  200)
    echo "IndexNow accepted $# changed URL(s)."
    ;;
  202)
    echo "IndexNow accepted $# changed URL(s); key validation is pending."
    ;;
  *)
    echo "IndexNow returned HTTP $HTTP_STATUS." >&2
    if [ -s "$RESPONSE_FILE" ]; then
      sed -n '1,20p' "$RESPONSE_FILE" >&2
    fi
    exit 1
    ;;
esac
