# GROWIX Web (React)

Клиенти React барои GROWIX API: экрани мобилии «Ҳисоботи Моҳона».

## Кор бо ин лоиҳа

```bash
cd web
npm install
npm run dev
```

Саҳифа: http://localhost:5173

API бояд кор кунад (`docker compose up` аз папкаи асосӣ). Суроғаи пешфарзи API: `http://localhost:8081`.
Агар API-ро бо `dotnet run` оғоз кунед, файли `.env` созед:

```
VITE_API_URL=http://localhost:5124
```

## Маълумоти намунавӣ

```bash
bash scripts/seed-demo.sh     # фурӯш, хароҷот, фирмаҳо, пардохтҳо
bash scripts/seed-debts.sh    # мол аз фирмаҳо гирифта шуд (қарз)
```

## Имконот

**Admin** (5 саҳифа):

- **Ҳисобот**: даромад, пардохт ба фирмаҳо, хароҷот аз рӯи категория, фоида ё зиён, қарз ба фирмаҳо, диаграммаи ҳафтаҳо
- **Фурӯш**: сабт, рӯйхати моҳ, нест кардан
- **Хароҷот**: Свет, Аренда, Маош, Барқ ё категорияи нав
- **Фирмаҳо**: қарз ба ҳар фирма, мол аз фирма гирифтем, пардохт ба фирма, рӯйхати фирмаҳо
- **Корбарон**: илова кардани корманд (Фурӯшанда) ё Admin-и нав, иваз кардани пароли худ

**Корманд / Фурӯшанда** (4 саҳифа):

- **Имрӯз**: фурӯши имрӯза (ҷамъ), сабти зуди фурӯш, рӯйхати имрӯза
- **Фурӯш**: таърихи фурӯши моҳ (бе имкони нест кардан)
- **Фирмаҳо**: рӯйхат ва телефони фирмаҳо (танҳо хондан)
- **Профил**: иваз кардани парол

Умумӣ: login бо JWT, refresh token-и худкор (бо ҳимоя аз refresh-и параллелӣ), санаҳо бо вақти Тоҷикистон (UTC+5), mobile-first. Нақшҳо дар API низ санҷида мешаванд, на танҳо дар экран.

## Сохтор

```
src/
├── api.js              # fetch + token + refresh
├── App.jsx
├── pages/              # Login, Report, Today, Sales, Expenses, Firms, FirmsView, Users, Profile
├── components/         # SummaryCard, ExpensesCard, ProfitBanner, FirmSharesCard, WeeklyChart, MonthSwitcher, RecordRow, BottomNav, SaleForm, ChangePasswordCard
├── hooks/              # useAsync, usePeriod
└── utils/              # format.js, dates.js
```

