#!/usr/bin/env bash

JSONNET_PATH=grafonnet-lib \
  jsonnet dashboard.jsonnet > provisioning/dashboards/dashboard.json

payload="{\"dashboard\": $(jq . provisioning/dashboards/dashboard.json), \"overwrite\": true}"

curl -X POST $BASIC_AUTH \
  -H 'Content-Type: application/json' \
  -d "${payload}" \
  "http://admin:changeme@localhost:3001/api/dashboards/db"