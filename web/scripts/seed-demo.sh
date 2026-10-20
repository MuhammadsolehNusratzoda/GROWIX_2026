#!/usr/bin/env bash
# Маълумоти намунавӣ барои моҳи ҷорӣ (мисли расми аввалини идея).
# Истифода:  bash scripts/seed-demo.sh
# Бо API дигар:  API=http://localhost:5124 bash scripts/seed-demo.sh
set -u

API="${API:-http://localhost:8081}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@pharmacypro.tj}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin@12345}"

YM="$(date +%Y-%m)"
DAYS="$(date -d "${YM}-01 +1 month -1 day" +%d)"

echo "API: $API  |  Моҳ: $YM"

LOGIN="$(curl -s -X POST "$API/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")"

TOKEN="$(echo "$LOGIN" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')"
if [ -z "$TOKEN" ]; then
  echo "Login нашуд. Ҷавоб: $LOGIN"
  exit 1
fi

post() {
  curl -s -X POST "$API/$1" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$2"
}

get_id() {
  echo "$1" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2
}

echo "1/4 Фирмаҳо..."
F1="$(get_id "$(post api/firms '{"name":"Фирма 1","phone":"+992900000001","address":"Душанбе"}')")"
F2="$(get_id "$(post api/firms '{"name":"Фирма 2","phone":"+992900000002","address":"Душанбе"}')")"
F3="$(get_id "$(post api/firms '{"name":"Фирма 3","phone":"+992900000003","address":"Хуҷанд"}')")"

if [ -z "$F1" ] || [ -z "$F2" ] || [ -z "$F3" ]; then
  echo "Фирмаҳо сохта нашуданд (шояд аллакай ҳастанд). Скрипт танҳо як маротиба кор мекунад."
  exit 1
fi

echo "2/4 Фурӯш аз рӯи ҳафтаҳо..."
post api/sales "{\"amount\":18200,\"saleDate\":\"${YM}-03T12:00:00+05:00\",\"method\":\"Cash\",\"note\":\"Ҳафтаи 1\"}" > /dev/null
post api/sales "{\"amount\":16500,\"saleDate\":\"${YM}-10T12:00:00+05:00\",\"method\":\"Cash\",\"note\":\"Ҳафтаи 2\"}" > /dev/null
post api/sales "{\"amount\":15300,\"saleDate\":\"${YM}-17T12:00:00+05:00\",\"method\":\"Card\",\"note\":\"Ҳафтаи 3\"}" > /dev/null
post api/sales "{\"amount\":11000,\"saleDate\":\"${YM}-24T12:00:00+05:00\",\"method\":\"Cash\",\"note\":\"Ҳафтаи 4\"}" > /dev/null
if [ "$DAYS" -ge 29 ]; then
  post api/sales "{\"amount\":14000,\"saleDate\":\"${YM}-29T12:00:00+05:00\",\"method\":\"Cash\",\"note\":\"Ҳафтаи 5\"}" > /dev/null
fi

echo "3/4 Хароҷот (Свет, Аренда, Маош, Барқ)..."
post api/expenses "{\"categoryId\":1,\"amount\":800,\"expenseDate\":\"${YM}-05T10:00:00+05:00\",\"note\":\"Свет\"}" > /dev/null
post api/expenses "{\"categoryId\":2,\"amount\":9000,\"expenseDate\":\"${YM}-01T10:00:00+05:00\",\"note\":\"Аренда\"}" > /dev/null
post api/expenses "{\"categoryId\":3,\"amount\":6000,\"expenseDate\":\"${YM}-15T10:00:00+05:00\",\"note\":\"Маош\"}" > /dev/null
post api/expenses "{\"categoryId\":4,\"amount\":1500,\"expenseDate\":\"${YM}-05T11:00:00+05:00\",\"note\":\"Барқ\"}" > /dev/null

echo "4/4 Пардохт ба фирмаҳо..."
post api/firm-payments "{\"firmId\":$F1,\"amount\":40000,\"paymentDate\":\"${YM}-08T12:00:00+05:00\",\"method\":\"Transfer\"}" > /dev/null
post api/firm-payments "{\"firmId\":$F2,\"amount\":20000,\"paymentDate\":\"${YM}-12T12:00:00+05:00\",\"method\":\"Transfer\"}" > /dev/null
post api/firm-payments "{\"firmId\":$F3,\"amount\":7500,\"paymentDate\":\"${YM}-20T12:00:00+05:00\",\"method\":\"Cash\"}" > /dev/null

echo "Тайёр! Саҳифаро навсозӣ кунед."
