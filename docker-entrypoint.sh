#!/bin/sh
set -e

# Generate runtime config from environment variables
# This runs at container startup so env vars can override defaults
cat > /usr/share/nginx/html/config.js <<EOF
window.__STORYTELLER_CONFIG__ = {
  baseURL: "${STORYTELLER_LLM_BASE_URL:-}",
  apiKey: "${STORYTELLER_LLM_API_KEY:-}",
  model: "${STORYTELLER_LLM_MODEL:-}",
};
EOF

exec "$@"
