#!/usr/bin/env bash
# Маълумоти намунавӣ барои қарз ба фирмаҳо (баъд аз seed-demo.sh ё бо фирмаҳои «Фирма 1/2/3»).
# Истифода:  bash scripts/seed-debts.sh
# Бо API дигар:  API=http://localhost:5124 bash scripts/seed-debts.sh
set -u

API="${API:-http://localhost:8081}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@pharmacypro.tj}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin@12345}"
YM="$(date +%Y-%m)"

LOGIN="$(curl -s -X POST "$API/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")"
TOKEN="$(echo "$LOGIN" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')"
if [ -z "$TOKEN" ]; then
  echo "Login нашуд. Ҷавоб: $LOGIN"
  exit 1
fi

FIRMS="$(curl -s "$API/api/firms?PageSize=100" -H "Authorization: Bearer $TOKEN")"

firm_id() {
  echo "$FIRMS" | grep -o "\"id\":[0-9][0-9]*,\"name\":\"$1\"" | grep -o '[0-9][0-9]*' | head -1
}

F1="$(firm_id 'Фирма 1')"; F2="$(firm_id 'Фирма 2')"; F3="$(firm_id 'Фирма 3')"
if [ -z "$F1" ] || [ -z "$F2" ] || [ -z "$F3" ]; then
  echo "Фирмаҳои «Фирма 1/2/3» ёфт нашуданд. Аввал: bash scripts/seed-demo.sh"
  exit 1
fi

post() {
  curl -s -X POST "$API/$1" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$2"
}

echo "Дору аз фирмаҳо гирифта шуд..."
post api/firm-purchases "{\"firmId\":$F1,\"amount\":100000,\"purchaseDate\":\"${YM}-02T12:00:00+05:00\",\"invoiceNumber\":\"N-101\"}" > /dev/null
post api/firm-purchases "{\"firmId\":$F2,\"amount\":35000,\"purchaseDate\":\"${YM}-06T12:00:00+05:00\",\"invoiceNumber\":\"N-102\"}" > /dev/null
post api/firm-purchases "{\"firmId\":$F3,\"amount\":7500,\"purchaseDate\":\"${YM}-11T12:00:00+05:00\",\"invoiceNumber\":\"N-103\"}" > /dev/null

echo "Тайёр! Агар seed-demo.sh иҷро шуда бошад, қарз: Фирма 1 = 60,000, Фирма 2 = 15,000, Фирма 3 = 0."
